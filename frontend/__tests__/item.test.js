import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'

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
describe('<Item/>', () => {
  it('it renders and displays properply', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>)
    // const PriceTag = wrapper.find('PriceTag')
    // console.log(PriceTag.dive().text())
    // console.log(wrapper.debug())
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