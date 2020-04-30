const Query = {
  cars: () => {
    global.cars = global.cars || []
    return global.cars
  }
};

module.exports = Query;
