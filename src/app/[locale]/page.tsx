import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  console.log("params", params);
  const { locale } = await params;
  const t = await getTranslations();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src="/logo.svg" alt="RIDGE ERP" className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#1a237e]">RIDGE</span>
            <span className="text-[#00bcd4] ml-2">ERP</span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            중소기업을 위한 스마트 ERP 솔루션
          </h2>
          <p className="text-lg text-gray-600">{t("homepage.subtitle")}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <div className="space-y-4">
            <Link
              href={`/${locale}/auth/login`}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
            >
              {t("auth.login")}
            </Link>

            <Link
              href={`/${locale}/auth/register`}
              className="w-full flex justify-center py-3 px-6 border-2 border-indigo-600 rounded-xl shadow-sm text-base font-semibold text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
            >
              {t("auth.register")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {t("homepage.keyFeatures")}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">💰</span>
              </div>
              <span className="text-gray-800 font-medium">
                {t("finance.title")}
              </span>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">📦</span>
              </div>
              <span className="text-gray-800 font-medium">
                {t("navigation.supplyChain")}
              </span>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">👥</span>
              </div>
              <span className="text-gray-800 font-medium">
                {t("navigation.crm")}
              </span>
            </div>
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">🏢</span>
              </div>
              <span className="text-gray-800 font-medium">
                {t("homepage.multiTenantArchitecture")}
              </span>
            </div>
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">🔐</span>
              </div>
              <span className="text-gray-800 font-medium">
                {t("homepage.roleBasedAccess")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
