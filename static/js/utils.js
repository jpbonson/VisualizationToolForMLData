// Generic auxiliar functions

function unique(value, index, self) { 
    return self.indexOf(value) === index;
}

function is_false(element, index, array) {
  return element === false;
}

function round_to_one_decimal(n) {
    return Math.round(n*10)/10;
}