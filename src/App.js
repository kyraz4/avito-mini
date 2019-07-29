import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import * as _ from 'lodash';

export default class App extends React.Component {

  constructor() {
    const prevData = JSON.parse(localStorage.getItem('favourites'));
    if (prevData === null) {
      localStorage.setItem('favourites', JSON.stringify([]));
    }
    super();
    this.state = {
        data: null,
        previousData : null,
        priceFromtext:'',
        priceTotext:'',
        priseSortedAcscending: false,
        ratingSortedAscending: false,
        electedData: JSON.parse(localStorage.getItem('favourites')),
    }
  }

  componentDidMount() {
   axios.all([this.getProductData(),this.getSellersData()])
   .then(axios.spread((resOne,resTwo) => {
    const fullData = resOne.data.data.map((el,i) => {
    const newEl = _.merge(el,_.find(resTwo.data.data, {id:el.relationships.seller}));
    newEl.id = i;
     return newEl;
    }
      );
     this.setState({
       data: fullData,
       previousData: fullData,
      });
   })).catch(message => console.log('Error',message));
  }
  
  onInputFromChange = (e) => {
    this.setState({ priceFromtext: e.target.value });
  }

  onInputToChange = (e) => {
    this.setState({ priceTotext: e.target.value });
  }

  onButtonFilterClick = (value) => {
    const newData = value === 'all' ? this.state.previousData :  this.state.previousData.filter((el) => el.category === value);
     this.setState({
       data:newData,
       priseSortedAcscending: false,
       ratingSortedAscending: false,
    });
  }

  onSearchClick = () => {
    if ((this.state.priceFromtext !== '') && (this.state.priceTotext !=='')){
      const filteredData = this.state.previousData.filter((el) => (el.price <= this.state.priceTotext) && (el.price >= this.state.priceFromtext));
      this.setState({data:filteredData,});
    } 
  }

  onButtonSortClick = (value) => {
    if (value === 'price') {
      const newData = this.state.priseSortedAcscending === true ? this.state.previousData.sort((a,b) => a.price - b.price) :
      this.state.previousData.sort((a,b) => b.price - a.price);
      this.setState({
      data:newData,
      priseSortedAcscending:!this.state.priseSortedAcscending,
    });
    } else {
     const newData = this.state.ratingSortedAscending === true ? this.state.previousData.sort((a,b) => a.rating - b.rating) :
     this.state.previousData.sort((a,b) => b.rating - a.rating);
     this.setState({
     data:newData,
     ratingSortedAscending: !this.state.ratingSortedAscending,
    });
    }
  }

  getProductData = () => {
    return axios.get('http://avito.dump.academy/products');
  }

  getSellersData = () => {
    return axios.get('http://avito.dump.academy/sellers');
  }

  onGetId = (value, isChecked) => {
     isChecked === false ? this.setState({electedData: [value,...this.state.electedData],}):
     this.setState({electedData: this.state.electedData.filter(el => el.id !== value.id )});
     const localData = JSON.stringify(this.state.electedData);
    localStorage.setItem('favourites', localData);
  }

  onButtonFauvoritesClick = () => {
    this.setState({data: this.state.electedData});
  }

  render() {
   return <div>
     <div className='header-container'>
        <h1>Avito-mini</h1>
     </div>
     <div className='btn-container'>
       <button onClick={() => this.onButtonFilterClick('immovable')}>недвижимость</button>
       <button onClick={() => this.onButtonFilterClick('cameras')}>фотоаппараты</button>
       <button onClick={() => this.onButtonFilterClick('auto')}>автомобили</button>
       <button onClick={() => this.onButtonFilterClick('laptops')}>ноутбуки</button>
       <button onClick={this.onButtonFauvoritesClick}>избранное</button>
       <button onClick={()=> this.onButtonFilterClick('all')}>все товары</button>
     </div>
     <div className='search-container'>
       <div>
     <button onClick={()=> this.onButtonSortClick('price')}>цена {this.state.priseSortedAcscending === false ? '↑' : '↓' }</button>
     <button onClick={()=> this.onButtonSortClick('rating')}>популярность {this.state.ratingSortedAscending === false ? '↑' : '↓' }</button>
       </div>
     <div className='price-filter-container'>
        <p>цена от:</p>
        <input type ='number' onChange = {this.onInputFromChange} value = {this.state.priceFromtext}></input>
        <p>до:</p>
        <input type ='number' onChange = {this.onInputToChange} value = {this.state.PriceToText}></input>
       <button onClick={this.onSearchClick}>найти</button>
       </div>
     </div>
   <div className = 'main-container'>
     {this.state.data === null ? <div>загрузка</div> : this.state.data.map(i => <Item value={i} key={i.id}  getId={this.onGetId} />)}
   </div>
   </div>;
  }
};

class Item extends React.Component {
  constructor(props) {  
    super(props);
    const localInfoChecked = JSON.parse(localStorage.getItem('favourites'));
    if (localInfoChecked !== null) {
    this.state = {
      checked: _.find(localInfoChecked, {id: this.props.value.id}) === undefined ? false : true,
    }
    } else {
      this.state = { checked: false}
    } 
  }
  
   onHeartClick = (el) => {
    this.setState({checked: !this.state.checked});
    this.props.getId(el.value, this.state.checked);
   }

  render() {
    return <div className="item">
    <div className='img-container'>
      {this.state.checked === true ? <button className='heart-checked' onClick={() => this.onHeartClick(this.props)}></button> : <button className='heart' onClick={() => this.onHeartClick(this.props)}></button>}
       <img src={this.props.value.pictures[0]} height = '400' width = '400' alt = ''/>
      <div className='photos-container'> 
      <p>{this.props.value.pictures.length-1}</p>
      <div className='photos'></div>  
      </div>
    </div>
    <p className='porduct'>{this.props.value.title}</p>
    <p className='price'>{this.props.value.price === undefined ? 'Цена не указана' : this.props.value.price.toLocaleString('ru')+' ₽'}</p>
    <p className='seller'>{this.props.value.name}</p>
    <p className='rating'>Рейтинг продавца: {this.props.value.rating}</p>
</div>;
  }
};

const mountNode = document.getElementById('root');
  ReactDOM.render(<App />, mountNode);