'use strict';

const { experiment, test, beforeEach } = exports.lab = require('lab').script();
const { expect } = require('code');

const React = require('react/addons');
const { TestUtils } = React.addons;

const { createContainer } = require('../src');

class Component extends React.Component {

  render(){
    return (
      <div />
    );
  }
}

experiment('createContainer', () => {

  let renderer;

  beforeEach((done) => {
    renderer = TestUtils.createRenderer();
    done();
  });

  test('returns a react component', (done) => {
    const Container = createContainer(Component);
    expect(TestUtils.isElement(<Container />)).to.equal(true);
    done();
  });

  test('accepts options that it calls into upon creation', (done) => {
    let count = 0;
    const Container = createContainer(Component, {
      getStores(){
        count++;
        return {};
      },

      getPropsFromStores(){
        count++;
        return {};
      }
    });
    renderer.render(<Container />);
    expect(count).to.equal(2);
    done();
  });

  test('state gets passed as props', (done) => {
    const Container = createContainer(Component, {
      getStores(){
        return {};
      },

      getPropsFromStores(){
        return {
          value: 1
        };
      }
    });
    renderer.render(<Container />);
    expect(renderer.getRenderOutput().props).to.deep.equal({ value: 1 });
    done();
  });

  test('passed props are propagated', (done) => {
    const Container = createContainer(Component, {
      getStores(){
        return {};
      },

      getPropsFromStores(){
        return {
          value: 1
        };
      }
    });
    renderer.render(<Container className='test' />);
    expect(renderer.getRenderOutput().props).to.deep.equal({ value: 1, className: 'test' });
    done();
  });

  test('state overrides passed props', (done) => {
    const Container = createContainer(Component, {
      getStores(){
        return {};
      },

      getPropsFromStores(){
        return {
          className: 'overridden'
        };
      }
    });
    renderer.render(<Container className='test' />);
    expect(renderer.getRenderOutput().props).to.deep.equal({ className: 'overridden' });
    done();
  });

  test('store listen methods are called upon mount', (done) => {
    let count = 0;

    const fakeStore = {
      listen(){
        count++;
      },
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    expect(count).to.equal(1);
    done();
  });

  test('also supports redux style subscribe by default', (done) => {
    let count = 0;

    const fakeStore = {
      subscribe(){
        count++;
        return function(){};
      }
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    expect(count).to.equal(1);
    done();
  });

  test('allows custom listen methods', (done) => {
    let count = 0;

    const fakeStore = {
      listen(){},
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      listen(store, onChange){
        expect(store).to.equal(fakeStore);
        expect(onChange).to.be.a.function();
        count++;
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    expect(count).to.equal(1);
    done();
  });

  test('store unlisten methods are called upon unmount', (done) => {
    let count = 0;

    const fakeStore = {
      listen(){},
      unlisten(){
        count++;
      }
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    renderer.unmount();
    expect(count).to.equal(1);
    done();
  });

  test('also supports redux style unsubscribe by default', (done) => {
    let count = 0;

    const fakeStore = {
      subscribe(){
        return function(){
          count++;
        };
      }
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    renderer.unmount();
    expect(count).to.equal(1);
    done();
  });

  test('allows custom unlisten methods', (done) => {
    let count = 0;

    const fakeStore = {
      listen(){},
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      unlisten(store, onChange){
        expect(store).to.equal(fakeStore);
        expect(onChange).to.be.a.function();
        count++;
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    renderer.unmount();
    expect(count).to.equal(1);
    done();
  });

  test('passes a remover into unlisten if listen returns', (done) => {
    let count = 0;

    function onRemove(){}

    const fakeStore = {
      listen(){},
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      listen(){
        return onRemove;
      },

      unlisten(store, onChange, remover){
        expect(remover).to.be.a.function();
        expect(remover).to.equal(onRemove);
        count++;
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    renderer.unmount();
    expect(count).to.equal(1);
    done();
  });

  test('does not pass a remover into unlisten if no return from listen', (done) => {
    let count = 0;

    const fakeStore = {
      listen(){},
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      listen(){

      },

      unlisten(store, onChange, remover){
        expect(remover).to.be.a.undefined();
        count++;
      },

      getPropsFromStores(){
        return {};
      }
    });
    renderer.render(<Container />);
    renderer.unmount();
    expect(count).to.equal(1);
    done();
  });

  test('supports default options', (done) => {
    const Container = createContainer(Component);

    function mountAndUnmount(){
      renderer.render(<Container />);
      renderer.unmount();
    }

    expect(mountAndUnmount).to.not.throw();
    done();
  });

  test('onChange is called upon listen and sets new state', (done) => {
    let state = {};
    let count = 0;

    const handlers = [];

    const fakeStore = {
      listen(handler){
        handlers.push(handler);
      },
      unlisten(){}
    };

    const Container = createContainer(Component, {
      getStores(){
        return {
          store: fakeStore
        };
      },

      getPropsFromStores(){
        return {
          value: ++count
        };
      }
    });

    Container.prototype.setState = function(newState){
      state = newState;
    };

    renderer.render(<Container />);

    handlers.forEach((fn) => fn());

    expect(state).to.deep.equal({ value: 2 });
    done();
  });

  test('throws if options are invalid', (done) => {
    function noGetStores(){
      const Container = createContainer(Component, {
        getPropsFromStores(){
          return {};
        }
      });
    }

    expect(noGetStores).to.throw('getStores function is required');

    function noGetPropsFromStores(){
      const Container = createContainer(Component, {
        getStores(){
          return {};
        }
      });
    }

    expect(noGetPropsFromStores).to.throw('getPropsFromStores function is required');

    done();
  });
});
