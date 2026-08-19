import { describe, expect, it } from "vitest";
import {
  getListingContacts,
  getListingSummary,
  getLocalizedCategoryName,
  getLocalizedListingContent,
  listingMatchesSearch,
  normalizeSearchText,
  hasActiveListingFilters,
  parseListingFilters,
  type PublicListing,
} from "./listings";

describe("listing helpers", () => {
  it("builds a short summary from listing description", () => {
    const listing: PublicListing = {
      id: "1",
      title: "Aula de Ingles",
      description: "Aulas particulares para moradores da regiao com foco em conversacao e preparacao para viagens.",
      price_label: "A combinar",
      category_name: "Servicos",
      city_name: "Cidade Exemplo",
      image_src: null,
      image_alt: null,
    };

    expect(getListingSummary(listing, 48)).toBe("Aulas particulares para moradores da regiao...");
  });

  it("keeps short descriptions unchanged", () => {
    const listing: PublicListing = {
      id: "1",
      title: "Padaria local",
      description: "Pao fresco todos os dias.",
      price_label: null,
      category_name: "Comercio",
      city_name: null,
      image_src: null,
      image_alt: null,
    };

    expect(getListingSummary(listing, 80)).toBe("Pao fresco todos os dias.");
  });

  it("builds public contact links in a stable order", () => {
    expect(
      getListingContacts({
        contact_whatsapp: "5511999999999",
        contact_phone: "(11) 9999-9999",
        contact_email: "demo@example.test",
        contact_url: "https://example.test",
      }),
    ).toEqual([
      { displayValue: "5511999999999", label: "WhatsApp", href: "https://wa.me/5511999999999" },
      { displayValue: "(11) 9999-9999", label: "Telefone", href: "tel:1199999999" },
      { displayValue: "demo@example.test", label: "Email", href: "mailto:demo@example.test" },
      { displayValue: "https://example.test", label: "Site", href: "https://example.test" },
    ]);
  });

  it("ignores missing public contacts", () => {
    expect(
      getListingContacts({
        contact_whatsapp: null,
        contact_phone: "",
        contact_email: "demo@example.test",
        contact_url: null,
      }),
    ).toEqual([{ displayValue: "demo@example.test", label: "Email", href: "mailto:demo@example.test" }]);
  });

  it("normalizes public listing filters from search params", () => {
    expect(
      parseListingFilters({
        q: "  aula particular  ",
        category: "servicos",
      }),
    ).toEqual({
      query: "aula particular",
      category: "servicos",
    });
  });

  it("drops empty listing filters and limits long queries", () => {
    expect(
      parseListingFilters({
        q: "a".repeat(90),
        category: undefined,
      }),
    ).toEqual({
      query: "a".repeat(80),
      category: "",
    });
  });

  it("detects active listing filters", () => {
    expect(hasActiveListingFilters({ query: "", category: "" })).toBe(false);
    expect(hasActiveListingFilters({ query: "aula", category: "" })).toBe(true);
    expect(hasActiveListingFilters({ query: "", category: "servicos" })).toBe(true);
  });

  it("normalizes search text by removing accents, punctuation, and casing differences", () => {
    expect(normalizeSearchText("  Beijupirá, PAIVA!  ")).toBe("beijupira paiva");
    expect(normalizeSearchText("Dra. Eulina - Acupuntura")).toBe("dra eulina acupuntura");
  });

  it("matches listings even when the search query has accent or punctuation differences", () => {
    const listing: Pick<PublicListing, "title" | "description" | "category_name"> = {
      title: "Beijupirá Paiva",
      description: "Restaurante com frutos do mar no Empório Gourmet.",
      category_name: "Pontos comerciais",
    };

    expect(listingMatchesSearch(listing, "beijupira")).toBe(true);
    expect(listingMatchesSearch(listing, "emporio gourmet")).toBe(true);
    expect(listingMatchesSearch(listing, "farmacia")).toBe(false);
  });

  it("localizes approved demo listings", () => {
    expect(
      getLocalizedListingContent(
        {
          title: "Drogasil Paiva",
          description: "Farmacia no Paiva.",
          price_label: "Atendimento em loja",
        },
        "en",
      ),
    ).toMatchObject({
      title: "Drogasil Paiva",
      price_label: "In-store service",
    });

    expect(
      getLocalizedListingContent(
        {
          title: "Seu Doce - Cookies congelados",
          description: "Cookies congelados.",
          price_label: "Consultar disponibilidade",
        },
        "es",
      ),
    ).toMatchObject({
      title: "Seu Doce - Cookies congelados",
      price_label: "Consultar disponibilidad",
    });
  });

  it("localizes category names from stable slugs", () => {
    expect(
      getLocalizedCategoryName(
        {
          slug: "produtos",
          name_pt_br: "Produtos novos e usados",
        },
        "en",
        "Category",
      ),
    ).toBe("New and used products");
  });
});
