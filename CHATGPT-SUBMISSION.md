# ChatGPT app submission: Made Good Designs (public MCP)

Submit at https://platform.openai.com/plugins → Upload new or existing plugin → **With MCP**. Org is already verified.
Each positive case below was run against the live server on 2026-10-28 and returned results.

## Connection
- MCP server URL: `https://madegooddesigns.com/inspiration/mcp`
- Authentication: none (public, read-only)

## Listing
- Name: `Made Good Designs` (OpenAI: don't add "MCP" / "Plugin" to the name)
- Short description: Search curated typography, brand-design, vintage annual-report and public-domain museum references, with a link to every source.
- Long description:
  Made Good Designs lets ChatGPT search a curated design-inspiration library, so it can pull real references instead of describing a style from memory.
  • 40,000+ typography, branding, logo, editorial, poster and lettering references, each with tags, a colour palette and its source
  • 4,000+ vintage corporate annual-report covers from the 1950s to the 1980s, with company, year, designer and industry
  • Nearly 1,000 public-domain (CC0) museum artworks chosen for designers, from The Met, the Art Institute of Chicago, the Rijksmuseum and others
  • 26 curated themes, from Swiss and editorial to Art Nouveau, Y2K and brutalist
  Every result links back to its Made Good Designs page and the original source.
- Example prompts:
  - Find serif wordmark logos I can use as references for a new brand.
  - Show me annual-report covers designed for transit authorities.
  - Find public-domain Mucha posters for a moodboard.
- Website: https://madegooddesigns.com/
- Support: https://madegooddesigns.com/design-mcp-server/ (contact hello@madegooddesigns.com)
- Privacy policy: https://madegooddesigns.com/design-mcp-server/privacy/
- Terms of service: https://madegooddesigns.com/design-mcp-server/terms/
- Icon: MGD logo, square PNG ≥ 48×48 (`~/Downloads/EtiennAubertBonn/MGD New logo.png` if square)
- Release notes: First public release. Six read-only tools for searching the Made Good Designs inspiration library: design references, curated themes, vintage annual reports, public-domain museum art and shared-page feedback.

## Test cases: 5 positive

1. **List themes**
   - Prompt: What design-inspiration themes does Made Good Designs have?
   - tools_triggered: list_inspiration_themes
   - expected_behavior: Lists the 26 curated themes with item counts and links to each theme on madegooddesigns.com.
2. **Browse a theme**
   - Prompt: Show me 5 brutalist design references from Made Good Designs.
   - tools_triggered: browse_inspiration_by_theme (theme: brutalist)
   - expected_behavior: Returns 5 brutalist items with title, description, tags, palette and a madegooddesigns.com link for each.
3. **Search design references**
   - Prompt: Find serif wordmark logos I can use as references for a new brand.
   - tools_triggered: search_design_inspiration (query: serif wordmark)
   - expected_behavior: Returns matching wordmark/logo references with descriptions, colour palettes and links back to their pages.
4. **Vintage annual reports**
   - Prompt: Show me 1970s annual-report covers designed for transit authorities.
   - tools_triggered: search_annual_reports (query: transit)
   - expected_behavior: Returns transit-authority annual-report covers (e.g. Montreal Urban Community Transit Commission 1972) with company, year, designer and a page link.
5. **Public-domain museum art**
   - Prompt: Find public-domain Japanese woodblock prints of waves for a moodboard.
   - tools_triggered: search_museum_art (query: woodblock wave, culture: Japan)
   - expected_behavior: Returns public-domain woodblock prints such as Hokusai's "Under the Wave off Kanagawa", with artist, date, holding museum, licence and links.

## Test cases: 3 negative

1. **Image generation**
   - Prompt: Design a new logo for my bakery and generate the image.
   - Why the app should not act: the app only searches existing references; it does not create images or designs.
   - Expected: ChatGPT does not call the app to generate anything (it may offer to find bakery or food-brand logo references instead).
2. **Unrelated question**
   - Prompt: What's the weather in Singapore tomorrow?
   - Why the app should not act: unrelated to design inspiration.
   - Expected: no Made Good Designs tool is called.
3. **Write/modify request on the read-only server**
   - Prompt: Delete all the items in my Made Good Designs boards.
   - Why the app should not act: the public server is read-only and has no access to personal boards.
   - Expected: no tool is called; ChatGPT explains it cannot modify boards through this app.

## Video walkthrough (Eugene records)
1–2 minute screen recording in ChatGPT (developer mode, connector added): run positive cases 3, 4 and 5, show a result link opening on madegooddesigns.com. Upload as an unlisted YouTube video and paste the URL.
