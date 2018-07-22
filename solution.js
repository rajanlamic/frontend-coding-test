export const add = (a, b, ...restPar) => {
  if (!a || !b || typeof a !== "number" || typeof b !== "number") return false;

  let res = a + b;
  if (restPar.length && Array.isArray(restPar)) {
    return (
      res +
      restPar.reduce((cum, cur) => {
        return cum + cur;
      })
    );
  }
  return res;
};

export const listToObject = list => {
  if (!Array.isArray(list) || !list.length) return false;

  let res = {};
  list.forEach(currVal => {
    res = Object.assign(
      res,
      JSON.parse(JSON.stringify({ [currVal.name]: currVal.value }))
    );
  });

  return res;
};

const isObject = obj => {
  if (
    obj !== null &&
    typeof obj === "object" &&
    toString.call(obj) === "[object Object]"
  ) {
    return true;
  }
  return false;
};

export const objectToList = obj => {
  if (!isObject(obj)) return false;

  let res = Object.keys(obj).map(key => {
    return Object.assign(
      {},
      JSON.parse(JSON.stringify({ name: key, value: obj[key] }))
    );
  });
  return res;
};

export const serialize = obj => {
  if (!isObject(obj)) return false;

  let res = {};
  for (let i in obj) {
    let row, column, columnVal;

    if (obj.hasOwnProperty(i)) {
      row = obj[i];
      if (row.length && Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          column = row[j];
          for (let k in column) {
            if (isObject(column[k])) {
              columnVal = column[k];
              res = {
                ...res,
                ...{ [`${i}${j}_${k}`]: serialize(columnVal) }
              };
            } else {
              res = {
                ...res,
                ...{ [`${i}${j}_${k}`]: column[k] }
              };
            }
          }
        }
      } else {
        res = {
          ...res,
          ...{ [i]: obj[i] }
        };
      }
    }
  }

  return res;
};

const getFormattedDate = timeStamp => {
  if (!timeStamp || typeof timeStamp !== "number") return false;

  let currentDate, currentMonth, res;
  currentDate = new Date(timeStamp);
  currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  res = `${currentDate.getDate()}/${currentMonth}/${currentDate.getFullYear()}`;
  return res;
};

export const deserialize = obj => {
  if (!isObject(obj)) return false;

  let res = {};
  let rowArrayObject = [];
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (i.indexOf("_") !== -1) {
        let rowSplit = i.split("_");
        let rowTxt = rowSplit[0].replace(/([0-9])/g, "");
        let rowIndex = rowSplit[0].replace(/([a-z])/g, "");
        let rowNameVal = rowSplit[1];
        let currentValue = obj[i];
        if (
          typeof currentValue === "string" &&
          currentValue.indexOf("t:") !== -1
        ) {
          currentValue = getFormattedDate(
            parseInt(currentValue.replace("t:", ""))
          );
        }

        if (!rowArrayObject[rowIndex]) {
          rowArrayObject[rowIndex] = {
            [rowNameVal]: isObject(obj[i]) ? deserialize(obj[i]) : currentValue
          };
        } else if (
          rowArrayObject[rowIndex] &&
          !rowArrayObject[rowIndex][rowNameVal]
        ) {
          rowArrayObject[rowIndex][rowNameVal] = isObject(obj[i])
            ? deserialize(obj[i])
            : currentValue;
        }
        res = { ...res, ...{ [rowTxt]: rowArrayObject } };
      } else {
        res = { ...res, ...{ [i]: obj[i] } };
      }
    }
  }
  return res;
};
