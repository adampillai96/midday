import { CommandMenu } from "@/components/command-menu";
import { ExportStatus } from "@/components/export-status";
import { Header } from "@/components/header";
import { HotKeys } from "@/components/hot-keys";
import { MobileOverview } from "@/components/mobile-overlay";
import { ConnectGoCardLessModal } from "@/components/modals/connect-gocardless-modal";
import { ConnectTransactionsModal } from "@/components/modals/connect-transactions-modal";
import { ImportCSVModal } from "@/components/modals/import-csv-modal";
import { SelectBankAccountsModal } from "@/components/modals/select-bank-accounts";
import { Sidebar } from "@/components/sidebar";
import { Cookies } from "@/utils/constants";
import { getCountryCode, isEUCountry } from "@midday/location";
import { currencies } from "@midday/location/src/currencies";
import { getUser } from "@midday/supabase/cached-queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const uniqueCurrencies = () => {
  const uniqueSet = new Set(Object.values(currencies));
  return [...uniqueSet];
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const countryCode = cookies().has(Cookies.CountryCode)
    ? cookies().get(Cookies.CountryCode)?.value
    : getCountryCode();

  const isEU = isEUCountry(countryCode);
  const mobileOverlay = cookies().has(Cookies.MobileOverlay);

  if (!user?.data?.team) {
    redirect("/teams");
  }

  return (
    <div className="relative">
      {!mobileOverlay && <MobileOverview />}

      <Sidebar />

      <div className="ml-[95px] mr-10 pb-8">
        <Header />
        {children}
      </div>

      <ConnectTransactionsModal isEU={isEU} />
      <ConnectGoCardLessModal countryCode={countryCode} />
      <SelectBankAccountsModal countryCode={countryCode} />
      <ImportCSVModal
        currencies={uniqueCurrencies()}
        defaultCurrency={currencies[countryCode]}
      />
      <ExportStatus />
      <CommandMenu />
      <HotKeys />
    </div>
  );
}
