module.exports = {
  "*.(tsx|ts)": () => "tsc-files --noEmit",
  "*.(tsx|ts|js)": ["eslint --fix", "prettier --write"],
  "*.(md|json)": "prettier --write",
};
