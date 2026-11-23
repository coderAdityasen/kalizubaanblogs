import AdminSetupBannerClient, { type AdminSetupBannerProps } from "./AdminSetupBannerClient";

/**
 * Database setup hint for the site owner while developing locally.
 *
 * This is a server component on purpose. In production it renders nothing, so
 * visitors (and Googlebot) never see a "View SQL Script" bar above the
 * homepage, the raw Supabase error message is not serialised into the page,
 * and the client chunk holding the schema SQL and policies is never shipped.
 * Before this, any Supabase outage (e.g. the egress-quota 402) made
 * checkSupabaseStatus report tableExists: false and the banner appeared on
 * the live homepage. Set up the table with `npm run dev` or the Supabase
 * dashboard instead.
 */
export default function AdminSetupBanner({ status }: AdminSetupBannerProps) {
  if (process.env.NODE_ENV === "production" || status.tableExists) {
    return null;
  }
  return <AdminSetupBannerClient status={status} />;
}
