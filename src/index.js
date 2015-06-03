'use strict';

const assert = require('assert');

const _ = require('lodash');
const React = require('react');

const defaultOptions = {
  getStores(){
    return {};
  },

  getPropsFromStores(){
    return {};
  }
};

function createContainer(Component, opts = defaultOptions){

  assert(opts.getStores, 'getStores function is required');
  assert(opts.getPropsFromStores, 'getPropsFromStores function is required');

  class StoreWrapper extends React.Component {

    constructor(...args){
      super(...args);

      this.state = opts.getPropsFromStores(this.props);

      this.onChange = this.onChange.bind(this);
    }

    componentWillMount(){
      const stores = opts.getStores(this.props);
      _.forEach(stores, (store) => store.listen(this.onChange));
    }

    componentWillUnmount(){
      const stores = opts.getStores(this.props);
      _.forEach(stores, (store) => store.unlisten(this.onChange));
    }

    onChange(){
      this.setState(opts.getPropsFromStores(this.props));
    }

    render(){
      const props = _.assign(this.props, this.state);

      return (
        <Component {...props} />
      );
    }
  }

  return StoreWrapper;
}

module.exports = { createContainer };
