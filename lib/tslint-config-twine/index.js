module.exports = {
  "extends": "tslint-config-airbnb",
  "rules": {
    "align": [false],
    "arrow-parens": true,
    "object-shorthand-properties-first": {
      "severity": "off"
    },
    "no-consecutive-blank-lines": [true, 2],
    "no-else-after-return": false,
    "no-multi-spaces": true,
    "no-unused-variable": true,
    "import-name": false,
    "object-curly-spacing": [true, "always"],
    "ter-arrow-parens": [true, "always"],
    "trailing-comma": [true, {
      "multiline": {
        "objects": "always",
        "arrays": "always",
        "functions": "never",
        "typeLiterals": "ignore"
      },
      "esSpecCompliant": true
    }],
    "space-before-function-paren": [true, {
      "anonymous": "always",
      "named": "always",
      "asyncArrow": "always",
      "method": "always",
      "constructor": "always"
    }],
    "typedef-whitespace": [
      true,
      {
        "call-signature": "nospace",
        "index-signature": "nospace",
        "parameter": "nospace",
        "property-declaration": "nospace",
        "variable-declaration": "nospace"
      },
      {
        "call-signature": "onespace",
        "index-signature": "onespace",
        "parameter": "onespace",
        "property-declaration": "onespace",
        "variable-declaration": "onespace"
      }
    ],
    "variable-name": [true, "ban-keywords", "check-format", "allow-pascal-case"],
    "whitespace": [
      true,
      "check-branch",
      "check-decl",
      "check-operator",
      "check-module",
      "check-separator",
      "check-rest-spread",
      "check-type",
      "check-typecast",
      "check-type-operator",
      "check-preblock"
    ],
  }
};
