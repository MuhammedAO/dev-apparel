//sometimes in ur application, you might have some that make calls to an APi, a dB or an external service and u don't want to neccesarily connect these 2 things inside of ur tests. doing would make ur tests really slow and u would also be relying on external service for instance to be at a 100% for ur tests to pass.

//Mocking is a technique to isolate test subjects by replacing dependencies with objects that you can control and inspect. A dependency can be anything your subject depends on, but it is typically a module that the subject imports.

//The goal for mocking is to replace something we don’t control with something we do, so it’s important that what we replace it with has all the features we need.

//The simplest way to create a Mock Function instance is with jest.fn().

function Person(name, foods) {
  this.name = name
  this.foods = foods
}

Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    // Simulate an API
    setTimeout(() => resolve(this.foods), 2000)
  })
}

describe('mocking learning', () => {
  it('mocks a reg function', () => {
    const fetchDogs = jest.fn()
    fetchDogs('april')
    expect(fetchDogs).toHaveBeenCalled()
    expect(fetchDogs).toHaveBeenCalledWith('april')
    fetchDogs('constantine')
    expect(fetchDogs).toHaveBeenCalledTimes(2)
  })

  it('can create a person', () => {
    const me = new Person('MO', ['rice', 'plantain'])
    expect(me.name).toBe('MO')
  })

  it('can fetch foods', async () => {
    const me = new Person('MO', ['rice', 'plaintain'])
    // mock the favFoods function
    me.fetchFavFoods = jest.fn().mockResolvedValue(['jollofRice', 'noodles'])
    const favFoods = await me.fetchFavFoods()
    console.log(favFoods)
    expect(favFoods).toContain('jollofRice')
  })
})