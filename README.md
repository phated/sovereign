# sovereign

[![Travis Build Status](https://img.shields.io/travis/iceddev/sovereign/master.svg?label=travis&style=flat-square)](https://travis-ci.org/iceddev/sovereign)

Separate your state from your components.

Higher-order component to wrap your stateless React components in a Flux container.

## Usage

```js
const React = require('react');
const { createContainer } = require('sovereign');

class StatelessComponent extends React.Component {

  render(){
    return (
      <div {...this.props} />
    );
  }
}

const StatefulContainer = createContainer(StatelessComponent, {
  getStores(){
    return {
      myStore: myFluxStore
    }
  },

  getPropsFromStores(){
    return myFluxStore.getState();
  }
});

React.render(StatefulContainer, document.getElementById('mount'));
```

## API

Sovereign exposes a single method `createContainer` that accepts a React component and a configuration
object that allows for fetching data from Flux stores. The configuration object requires 2 functions,
`getStores` and `getPropsFromStores`.

### createContainer(Component, [options]);

This is the method that allows wrapping a stateless component in a stateful container.  Any state from
the Flux stores may be returned and will be passed as props to the wrapped component.  `options` are
optional but if you don't pass them, you probably shouldn't be using this.

#### Component

Must be a valid React component.

#### Options

Options requires 2 methods, `getStores` and `getPropsFromStores`.
Also, 2 methods (`listen` and `unlisten`) are optional.

##### getStores(props)

This method must return stores that you would like to listen to.  An array or object of stores must be returned.
Stores must have `listen` and `unlisten` functions available.

##### getPropsFromStores(props)

This method must return the state from the stores that you would like turned into props.  If you are using a
library like [`alt`](https://github.com/goatslacker/alt), you could just return `myStore.getState()` or
you can create a subset or aggregate from multiple stores.  An object must be returned.  This method is called
to get initial state as well as updated state upon `listen` firing.

##### listen(store, onChange)

This method is called for each store on mount, passing the store and the `onChange` listener into the method.
The default `listen` method calls `store.listen(onChange)`, but you can override that with this method on
options. If `listen` returns a function, it is passed into the `unlisten` option (typically this is used
as a remover function).

##### unlisten(store, onChange, remover)

This method is called for each store on unmount, passing the store, `onChange` listener, and possibly a
`remover` method if it was returned by the `listen` option. The default `unlisten` method calls
`store.unlisten(onChange)`, but you can override that with this method on options. If the `listen` option
returned a function, this method will receive that function as the last parameter and it can be used
as part of you `unlisten` phase.

## Shoutout

Shoutout to [`alt`](https://github.com/goatslacker/alt) which had a similar higher-order component as an addon but
I didn't completely like the API and wanted this as a standalone library.

## License

MIT
