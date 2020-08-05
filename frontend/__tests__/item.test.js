import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'
import toJSON from 'enzyme-to-json'

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 4000,
  description: 'This item is really cool!',
  image: 'man.jpg',
  largeImage: 'largeman.jpg',
}

//The shallow renderer is perfect for unit test as it doesn’t render any child components allowing us to focus testing in one component.
//our wrapper constant will contain all the nodes of this component.

//mount method renders the full DOM including the child components of the parent component that we are running the tests. 
//This is more suitable when there are components which directly interfere with DOM API or lifecycle methods of React.

// debug() => Returns an html-like string of the wrapper for debugging purposes. Useful to print out to the console when tests are not passing when you expect them to.

//dive() => Shallow renders one level deeper, .children() can also be used.


//To write a snapshot test, you first get your code working, say, a React component, then generate a snapshot of it’s expected output given certain data. The snapshot tests are committed alongside the component and every time the tests are run. Jest will compare the snapshot to the rendered output for the test.

//Snapshot tests are a very useful tool whenever you want to make sure your UI does not change unexpectedly. A typical snapshot test case for a mobile app renders a UI component, takes a snapshot, then compares it to a reference snapshot file stored alongside the test.

//If the test does not pass, it may mean that there were some unexpected changes on the component that you need to fix, or you made some changes to the component and it’s about time you updated the snapshot tests.

//toJson helper is used to convert any Enzyme wrapper to a format compatible with Jest snapshot.

describe('<Item/>', () => {
  it('it renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>)
    expect(toJSON(wrapper)).toMatchSnapshot()
  })

  it('renders the image properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const img = wrapper.find('img')
    expect(img.props().src).toBe(fakeItem.image)
    expect(img.props().alt).toBe(fakeItem.title)
  })

  it('renders the pricetag and title', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const PriceTag = wrapper.find('PriceTag')
    expect(PriceTag.children().text()).toBe('$40')
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  })

  it('renders out the buttons properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const buttonList = wrapper.find('.buttonList')
    expect(buttonList.children()).toHaveLength(3)
    expect(buttonList.find('Link')).toHaveLength(1)
    expect(buttonList.find('AddToCart')).toBeTruthy()
    expect(buttonList.find('DeleteItem').exists()).toBe(true)
  })

})