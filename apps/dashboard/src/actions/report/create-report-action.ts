"use server";

import { action } from "@/actions/safe-action";
import { createReportSchema } from "@/actions/schema";
import { LogEvents } from "@midday/events/events";
import { setupLogSnag } from "@midday/events/server";
import { getUser } from "@midday/supabase/cached-queries";
import { createClient } from "@midday/supabase/server";
import { Dub } from "dub";

const dub = new Dub({ projectSlug: "midday" });

export const createReportAction = action(createReportSchema, async (params) => {
  const supabase = createClient();
  const user = await getUser();

  const { data } = await supabase
    .from("reports")
    .insert({
      team_id: user.data.team_id,
      from: params.from,
      to: params.to,
      type: params.type,
      expire_at: params.expiresAt,
      currency: params.currency,
      created_by: user.data.id,
    })
    .select("*")
    .single();

  const link = await dub.links.create({
    url: `${params.baseUrl}/report/${data.id}`,
    expiresAt: params.expiresAt,
    rewrite: true,
  });

  const { data: linkData } = await supabase
    .from("reports")
    .update({
      link_id: link.id,
      short_link: link.shortLink,
    })
    .eq("id", data.id)
    .select("*")
    .single();

  const logsnag = await setupLogSnag({
    userId: user.data.id,
    fullName: user.data.full_name,
  });

  logsnag.track({
    event: LogEvents.OverviewReport.name,
    icon: LogEvents.OverviewReport.icon,
    channel: LogEvents.OverviewReport.channel,
  });

  return linkData;
});
