var numeral = require("numeral");

export function format(number) {
  return numeral(number).format('0,0');
}
