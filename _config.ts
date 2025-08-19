import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import typography from "npm:@tailwindcss/typography";
import date from "lume/plugins/date.ts";

import postcss from "lume/plugins/postcss.ts";


const site = lume();
site.copy("boid.gif");

site.use(date());
site.use(tailwindcss({
    options: {
      plugins: [typography],
    },
}));
site.use(postcss());

export default site;
