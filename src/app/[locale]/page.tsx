import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMessages } from "@/i18n/messages";
import { isLocale } from "@/i18n/config";
import { getSpellCheckLanguage } from "@/i18n/text-input";
import {
  getListingSummary,
  getListingImage,
  listingMatchesSearch,
  getLocalizedLocationName,
  getLocalizedCategoryName,
  getLocalizedListingContent,
  hasActiveListingFilters,
  parseListingFilters,
  type PublicListing,
} from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
};

function firstRelation<T>(relation: T | T[] | null) {
  return Array.isArray(relation) ? relation[0] : relation;
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const filters = parseListingFilters(await searchParams);

  if (!isLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const spellCheckLanguage = getSpellCheckLanguage(locale);
  const hasFilters = hasActiveListingFilters(filters);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const listingsQuery = supabase
    .from("listings")
    .select(
      `
        id,
        title,
        description,
        price_label,
        categories!inner(slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn),
        cities(slug, name)
      `,
    )
    .eq("status", "approved")
    .eq(filters.category ? "categories.slug" : "status", filters.category || "approved")
    .order("title", { ascending: true })
    .limit(filters.query ? 60 : 12);
  const [{ data }, { data: categories }] = await Promise.all([
    listingsQuery,
    supabase.from("categories").select("slug, name_pt_br, name_en, name_es, name_ru, name_zh_cn").eq("is_active", true).order("sort_order"),
  ]);
  const listings: PublicListing[] =
    data
      ?.map((listing) => {
      const category = firstRelation(listing.categories);
      const city = firstRelation(listing.cities);
      const content = getLocalizedListingContent(listing, locale);
      const image = getListingImage(content.title);

      return {
        id: listing.id,
        title: content.title,
        description: content.description,
        price_label: content.price_label,
        category_name: getLocalizedCategoryName(category, locale, t.category),
        city_name: getLocalizedLocationName(city?.name, locale, t.listingLocationFallback),
        image_src: image?.src ?? null,
        image_alt: image?.alt ?? null,
      };
    })
      .filter((listing) => listingMatchesSearch(listing, filters.query))
      .slice(0, 12) ?? [];

  return (
    <div className="paiva-page min-h-screen text-slate-950">
      <SiteHeader isAuthenticated={Boolean(user)} locale={locale} messages={t} />
      <section className="paiva-hero">
        <div className="relative z-10 mx-auto grid min-h-[420px] max-w-6xl content-end px-4 py-10 sm:min-h-[500px]">
          <div className="max-w-3xl pb-8 text-white">
            <p className="mb-3 text-sm font-medium uppercase text-amber-100">{t.publicExperienceNotice}</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{t.tagline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-teal-50">{t.intro}</p>
          </div>
        </div>
      </section>
      <section className="relative z-20 mx-auto grid max-w-6xl gap-10 px-4 py-10">
        <form className="-mt-16 grid gap-3 rounded-lg border border-white/10 bg-[#f8f5eb] p-4 shadow-lg shadow-black/20 sm:grid-cols-[1fr_220px_auto]">
          <Input
            aria-label={t.searchPlaceholder}
            autoComplete="off"
            defaultValue={filters.query}
            lang={spellCheckLanguage}
            name="q"
            placeholder={t.searchPlaceholder}
            type="search"
          />
          <select
            aria-label={t.category}
            className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            defaultValue={filters.category}
            name="category"
          >
            <option value="">{t.category}</option>
            {categories?.map((category) => (
              <option key={category.slug} value={category.slug}>
                {getLocalizedCategoryName(category, locale, t.category)}
              </option>
            ))}
          </select>
          <Button type="submit">{t.search}</Button>
        </form>
        <div>
          <h2 className="text-2xl font-semibold text-teal-50">{t.latestListings}</h2>
          {listings.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <article key={listing.id} className="overflow-hidden rounded-lg border border-white/10 bg-[#f8f5eb] shadow-sm shadow-black/10">
                  {listing.image_src ? (
                    <Link
                      aria-label={`${t.viewListing}: ${listing.title}`}
                      className="mx-auto mt-5 block h-40 w-28 overflow-hidden rounded-md bg-[#eef3e2] shadow-sm ring-1 ring-teal-900/10 transition hover:scale-[1.02] hover:ring-teal-700"
                      href={`/${locale}/listings/${listing.id}`}
                    >
                      <Image
                        alt={listing.image_alt ?? listing.title}
                        className="h-full w-full object-contain"
                        height={160}
                        src={listing.image_src}
                        width={112}
                      />
                    </Link>
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase text-teal-700">{listing.category_name}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">{listing.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{getListingSummary(listing, 110)}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-900">
                        {listing.city_name ?? t.listingLocationFallback}
                      </span>
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-900">
                        {listing.price_label ?? t.listingPriceFallback}
                      </span>
                    </div>
                    <Link
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-teal-800 px-4 text-sm font-medium text-white hover:bg-teal-900"
                      href={`/${locale}/listings/${listing.id}`}
                    >
                      {t.viewListing}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-white/20 bg-[#f8f5eb] p-8">
              <h3 className="text-lg font-semibold text-slate-950">
                {hasFilters ? t.noFilteredListingsTitle : t.emptyListingsTitle}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
                {hasFilters ? t.noFilteredListingsBody : t.emptyListingsBody}
              </p>
              {hasFilters ? (
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  href={`/${locale}`}
                >
                  {t.clearFilters}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
      <SiteFooter locale={locale} />
    </div>
  );
}
