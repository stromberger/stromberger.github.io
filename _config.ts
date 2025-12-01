import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import typography from "npm:@tailwindcss/typography";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import postcss from "lume/plugins/postcss.ts";
import markdown from "lume/plugins/markdown.ts";


const site = lume({
  location: new URL("https://st.fyi/"),
});

site.use(markdown({
  options: {
    html: true,
  },
}));

site.data("site", {
  url: "https://st.fyi",
});
site.copy("boid.gif");
site.copy("robots.txt");
site.copy("profile.jpeg");

site.use(date());
site.use(sitemap());
site.use(tailwindcss({
    options: {
      plugins: [typography],
    },
}));
site.use(postcss());

export default site;
