//You use the describe to group together related test.
//generally you have one describe per test file, however, it is not uncommon to have multiple describe(s)

//The expect function is used every time you want to test a value. You will rarely call expect by itself.
//toEqual => Used when you want to check that two objects have the same value. This matcher recursively checks the equality of all fields, rather than checking for object identity.

//it() Creates a test closure.

describe('Testing 101', () => {

  it('works as expected', () => {
    const age = 100
    expect(1).toEqual(1)
    expect(age).toEqual(100)
  })

  it('handles ranges just fine', () => {
    const age = 200
    expect(age).toBeGreaterThan(100)
  })

  it('lists works as well too', () => {
    const games = ['pes2020', 'fifa2020']
    expect(games).toEqual(games)
    expect(games).toContain('pes2020')
    expect(games).toContain('fifa2020')
  })

})

