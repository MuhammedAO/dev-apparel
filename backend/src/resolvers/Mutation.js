const mutations = {
  createTesla: (parent, args) => {
    global.cars = global.cars || []

    const newCar = { name: args.name, model: args.model }
    
    global.cars.push(newCar)

    return newCar
    // console.log(args);

  }
};

module.exports = mutations;
