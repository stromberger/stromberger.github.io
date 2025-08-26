import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import typography from "npm:@tailwindcss/typography";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";

import postcss from "lume/plugins/postcss.ts";


const site = lume({
  location: new URL("https://st.fyi/"),
});

site.data("site", {
  url: "https://st.fyi",
});
site.copy("boid.gif");
site.copy("robots.txt");

site.use(date());
site.use(sitemap());
site.use(tailwindcss({
    options: {
      plugins: [typography],
    },
}));
site.use(postcss());

export default site;
