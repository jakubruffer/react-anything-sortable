/* eslint no-unused-expressions:0 */
import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from '../../src/index';
import DemoItem from '../../demo/components/DemoItem';
import DemoHOCItem from '../../demo/components/DemoHOCItem';
import triggerEvent from '../triggerEvent';
import spies from 'chai-spies';
import { moveX, moveY } from '../mouseMove';

chai.use(spies);


// Delay karma test execution
window.__karma__.loaded = () => {};

function injectCSS() {
  const link = document.createElement('link');
  link.href = 'base/demo/style.css';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  link.onload = () => {
    const div = document.createElement('div');
    div.id = 'react';
    document.body.appendChild(div);
    window.__karma__.start();
  };
}

injectCSS();


const expect = chai.expect;


describe('Sortable', () => {
  describe('Default scenario', () => {
    beforeEach(() => {
      ReactDOM.render(<Sortable />, document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
    });

    it('should render properly without any child', () => {
      const node = document.querySelector('.ui-sortable');
      expect(node).to.exist;
    });
  });

  describe('Provide sortable children', () => {
    beforeEach(() => {
      ReactDOM.render(
        <Sortable>
          <DemoItem sortData="1" />
          <DemoItem sortData="2" />
          <DemoItem sortData="3" />
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
    });

    it('should render 3 children', () => {
      const children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(3);
    });
  });

  describe('Provide sortable child', () => {
    beforeEach(() => {
      ReactDOM.render(
        <Sortable>
          <DemoItem sortData="1" />
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
    });

    it('should render 1 child', () => {
      const children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(1);
    });
  });

  describe('Provide sortable children with nulls', () => {
    beforeEach(() => {

      ReactDOM.render(
        <Sortable>
          {
            ['hello1', 'hello2', ''].map(function(name) {
              if (name) {
                return (<DemoItem sortData={name} />);
              }
              else {
                return null;
              }
            })
          }
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
    });

    it('should render 2 children', () => {
      const children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(2);
    });
  });

  describe('Dragging children', () => {
    let component, target;

    beforeEach(() => {
      component = ReactDOM.render(
        <Sortable className="style-for-test">
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
      component = null;
      target = null;
    });

    it('should add a dragging children', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
      });

      triggerEvent(target, 'mousemove');

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(4);
    });

    it('should place dragging children in dragging position', () => {
      target = document.querySelector('.ui-sortable-item:nth-child(3)');

      triggerEvent(target, 'mousedown', {
        clientX: 150,
        clientY: 30,
      });

      triggerEvent(target, 'mousemove', {
        clientX: 149,
        clientY: 30
      });

      const child = ReactDOM.findDOMNode(component).querySelector('.ui-sortable-placeholder');
      const children = [].slice.call(ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item'));
      expect(children.length).to.equal(4);
      expect(children.indexOf(child)).to.equal(2);
    });

    it('should switch position when dragging from left to right', () => {
      target = document.querySelector('.ui-sortable-item');
      moveX(target, 25, 210);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[children.length - 1].textContent).to.equal('1');
    });

    it('should switch position when dragging from right to left', () => {
      target = document.querySelector('.item-3');
      moveX(target, 210, 25);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[0].textContent).to.equal('3');
    });

    it('should remove dragging children when mouseup', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 50,
        clientY: 10
      });

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(3);
    });

    it('should NOT move item if there is no preceding mousedown event', () => {
      target = document.querySelector('.item-1');

      triggerEvent(target, 'mousedown', {
        clientX: 25,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 25,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 26,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 300,
        clientY: 20
      });

      target = document.querySelector('.ui-sortable-dragging');
      expect(target).to.not.exist;
    });
  });

  describe('Dragging children verically', () => {
    let component, target;

    beforeEach(() => {
      component = ReactDOM.render(
        <Sortable className="style-for-test full-width">
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
      component = null;
      target = null;
    });


    it('should switch position when dragging from up to down', () => {
      target = document.querySelector('.ui-sortable-item');

      moveY(target, 25, 180);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[children.length - 1].textContent).to.equal('1');
    });


    it('should switch position when dragging from down to up', () => {
      target = document.querySelector('.item-3');
      moveY(target, 180, 25);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[0].textContent).to.equal('3');
    });
  });

  describe('onSort Props', () => {
    let callback;

    beforeEach(() => {
      callback = chai.spy();

      ReactDOM.render(
        <Sortable onSort={callback}>
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
      callback = null;
    });

    it('should call onSort when a drag\'n\'drop finished', () => {
      const target = document.querySelector('.item-1');
      moveX(target, 25, 210);
      expect(callback).to.have.been.called.with(['2', '3', '1']);
    });

    it('should call onSort when a opposite drag\'n\'drop finished', () => {
      const target = document.querySelector('.item-3');
      moveX(target, 210, 25);
      expect(callback).to.have.been.called.with(['3', '1', '2']);
    });

    it('should call onSort anytime there is a mouseup fired', () => {
      const target = document.querySelector('.item-1');
      moveX(target, 25, 80);
      moveX(target, 80, 180);
      expect(callback).to.have.been.called.twice;
    });
  });

  describe('containment', () => {
    it('should NOT move when mouse outside of Sortable container', () => {
      ReactDOM.render(
        <Sortable containment>
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.getElementById('react'));

      const target = document.querySelector('.item-1');
      moveY(target, 100, 20, 25, true);

      const draggingItem = document.querySelector('.ui-sortable-dragging');
      expect(draggingItem.getBoundingClientRect().top).to.be.below(100);
    });
  });

  describe('Higher order component', () => {
    let component, target;

    beforeEach(() => {
      component = ReactDOM.render(
        <Sortable className="style-for-test">
          <DemoHOCItem sortData="1" className="item-1" key={1}>1</DemoHOCItem>
          <DemoHOCItem sortData="2" className="item-2" key={2}>2</DemoHOCItem>
          <DemoHOCItem sortData="3" className="item-3" key={3}>3</DemoHOCItem>
        </Sortable>
      , document.getElementById('react'));
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
      component = null;
      target = null;
    });

    it('should add a dragging children', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mousemove');

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(4);
    });


    it('should switch position when dragging from left to right', () => {
      target = document.querySelector('.ui-sortable-item');
      moveX(target, 25, 210);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[children.length - 1].textContent).to.equal('1');
    });


    it('should switch position when dragging from right to left', () => {
      target = document.querySelector('.item-3');
      moveX(target, 210, 25);

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children[0].textContent).to.equal('3');
    });

    it('should remove dragging children when mouseup', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 50,
        clientY: 10
      });

      const children = ReactDOM.findDOMNode(component).querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(3);
    });

    it('should NOT move item if there is no preceding mousedown event', () => {
      target = document.querySelector('.item-1');

      triggerEvent(target, 'mousedown', {
        clientX: 25,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 25,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 26,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 300,
        clientY: 20
      });

      target = document.querySelector('.ui-sortable-dragging');
      expect(target).to.not.exist;
    });
  });

  describe('Sort handle', () => {
    afterEach(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('react'));
    });

    it('should not move when `sortHandleClass` is set and target doesn\'t match', () => {
      ReactDOM.render(
        <Sortable sortHandle="handle">
          <DemoItem sortData="1" className="item-1">
            1
            <span className="handle">↔</span>
          </DemoItem>
          <DemoItem sortData="2" className="item-2">
            2
            <span className="handle">↔</span>
          </DemoItem>
          <DemoItem sortData="3" className="item-3">
            3
            <span className="handle">↔</span>
          </DemoItem>
        </Sortable>
      , document.getElementById('react'));

      const target = document.querySelector('.item-1');
      moveY(target, 100, 20, 25, true);

      let draggingItem = document.querySelector('.ui-sortable-dragging');
      expect(draggingItem).to.not.exist;

      const handle = document.querySelector('.item-1 .handle');
      moveX(handle, 100, 20, 25, true);
      draggingItem = document.querySelector('.ui-sortable-dragging');

      expect(draggingItem).to.exist;
    });

    it('should not throw when sort handle is/contains SVG', () => {
      ReactDOM.render(
        <Sortable sortHandle="handle">
          <DemoItem sortData="1" className="item-1">
            1
            <span className="handle">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><path d="M.004.393H4.74l6.56 10.61-.003-10.61H16v15.214h-4.696L4.71 4.997v10.61H0L.004.393" fill-rule="nonzero"></path></svg>
            </span>
          </DemoItem>
          <DemoItem sortData="2" className="item-2">
            2
            <span className="handle">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><path d="M.004.393H4.74l6.56 10.61-.003-10.61H16v15.214h-4.696L4.71 4.997v10.61H0L.004.393" fill-rule="nonzero"></path></svg>
            </span>
          </DemoItem>
          <DemoItem sortData="3" className="item-3">
            3
            <span className="handle">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><path d="M.004.393H4.74l6.56 10.61-.003-10.61H16v15.214h-4.696L4.71 4.997v10.61H0L.004.393" fill-rule="nonzero"></path></svg>
            </span>
          </DemoItem>
        </Sortable>
      , document.getElementById('react'));

      const target = document.querySelector('.item-1');
      moveY(target, 100, 5, 25, true);

      let draggingItem = document.querySelector('.ui-sortable-dragging');
      expect(draggingItem).to.not.exist;

      const handle = document.querySelector('.item-1 .handle svg path');
      moveX(handle, 100, 20, 25, true);
      draggingItem = document.querySelector('.ui-sortable-dragging');

      expect(draggingItem).to.exist;
    });
  });
});

