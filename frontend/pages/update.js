import UpdateItem from '../components/UpdateItem'

//query prop gotten from _app.js
const Sell = ({query}) =>{

  return (
    <div>
      <UpdateItem id={query.id}  />
    </div>
  )
 }

export default Sell

