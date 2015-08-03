'use strict';

const assert = require('assert');

const _ = require('lodash');
const React = require('react');

const defaultOptions = {
  getStores(){
    return {};
  },

  listen(store, onChange){
    if(typeof store.subscribe === 'function'){
      return store.subscribe(onChange);
    } else {
      store.listen(onChange);
    }
  },

  unlisten(store, onChange, unsubscribe){
    if(typeof unsubscribe === 'function'){
      unsubscribe();
    } else {
      store.unlisten(onChange);
    }
  },

  getPropsFromStores(){
    return {};
  }
};

function createContainer(Component, opts = defaultOptions){

  const { getStores, getPropsFromStores } = opts;

  assert(getStores, 'getStores function is required');
  assert(getPropsFromStores, 'getPropsFromStores function is required');

  const listen = opts.listen || defaultOptions.listen;
  const unlisten = opts.unlisten || defaultOptions.unlisten;

  class StoreWrapper extends React.Component {

    constructor(...args){
      super(...args);

      this.removers = {};

      this.onChange = this.onChange.bind(this);
    }

    componentWillMount(){
      const stores = getStores(this.props);
      this.removers = _.mapValues(stores, (store) => listen(store, this.onChange));
    }

    componentWillUnmount(){
      const stores = getStores(this.props);
      _.forEach(stores, (store, key) => unlisten(store, this.onChange, this.removers[key]));
    }

    onChange(){
      this.forceUpdate();
    }

    render(){
      const state = getPropsFromStores(this.props);
      const props = _.assign({}, this.props, state);

      return (
        <Component {...props} />
      );
    }
  }

  return StoreWrapper;
}

module.exports = { createContainer };
