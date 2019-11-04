// tslint:disable-next-line: file-name-casing
const calculateAverageVelocity = (
  array: any,
  category: any,
  indexValue: any
) => {
  //avgValue defaults to 2 decimals max
  const avgValue =
    Math.round(
      array
        .map((values: any) => values[category][indexValue].count)
        .reduce(
          (
            accumulator: number,
            currentValue: number,
            currentIndex: number,
            array: [any]
          ) => {
            accumulator += currentValue;
            if (currentIndex === array.length - 1) {
              return accumulator / array.length;
            } else {
              return accumulator;
            }
          }
        ) * 100
    ) / 100;
  /*
  console.log(
    "Received window, measuring: " +
      category +
      ": " +
      array.map((values: any) => values[category][indexValue].count) +
      " - Average: " +
      avgValue
  );
*/
  return avgValue;
};
export default calculateAverageVelocity;
