import React, { useReducer, useState, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should never get there!');
  }
}

const httpReducer = (curhttpState, action) => {
  switch (action.type) {
    case 'SEND_REQUEST':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...curhttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...curhttpState, error: null }
    default:
      throw new Error('Should never get here!');
  }
}

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false, 
    error: null 
  });
  //const [ userIngredients, setUserIngredients ] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({ type: 'SEND_REQUEST' });
    //setIsLoading(true);
    fetch('https://react-hooks-update-64117.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({ type: 'RESPONSE' });
      //setIsLoading(false);
      return response.json();
    }).then(body => {
      // setUserIngredients(prevIngredients => [
      //   ...prevIngredients, 
      //   { id: body.name, ...ingredient }
      // ]); 
      dispatch({ type: 'ADD', ingredient: { id: body.name, ...ingredient } })
    });
  };

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({ type: 'SEND_REQUEST' });
    //setIsLoading(true);
    fetch(`https://react-hooks-update-64117.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then(response => {
      dispatchHttp({ type: 'RESPONSE' });
      //setIsLoading(false);
      // setUserIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({ type: 'DELETE', id: ingredientId })
    }).catch(error => {
      dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' }); // or error.message
      //setError(error.message); // sets the error
      //setIsLoading(false); // removes the spinner
    });
  };

  const clearError = () => {
    dispatchHttp({ type: 'CLEAR' });
    //setError(null);
    console.log("clearError function");
  } 
  
  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading} />

      <section>
        <Search onLoadIngredients={filteredIngredientHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  ); 
}

export default Ingredients;
