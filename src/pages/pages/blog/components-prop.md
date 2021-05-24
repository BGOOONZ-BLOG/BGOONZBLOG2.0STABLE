---
title: Components & Props in React
excerpt: "Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. This page provides an introduction to the idea of components. You can find a\_detailed component API reference here."
date: '2021-05-23'
thumb_image: images/react.jpg
image: images/10.jpg
seo:
  title: Introducing The Web-Dev-HubTheme
  description: >-
    Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. This page provides an introduction to the idea of components. You can find a\_detailed component API reference here
  extra:
    - name: 'og:type'
      value: article
      keyName: property
    - name: 'og:title'
      value: Introducing The Web-Dev-HubTheme
      keyName: property
    - name: 'og:description'
      value: >-
         Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. This page provides an introduction to the idea of components. You can find a\_detailed component API reference here
      keyName: property
    - name: 'og:image'
      value: images/3.jpg
      keyName: property
      relativeUrl: true
    - name: 'twitter:card'
      value: summary_large_image
    - name: 'twitter:title'
      value: Introducing The Web-Dev-HubTheme
    - name: 'twitter:description'
      value: >-
        Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. This page provides an introduction to the idea of components. You can find a\_detailed component API reference here
    - name: 'twitter:image'
      value: images/3.jpg
      relativeUrl: true
template: post
---

# Components And Props

## Components and Props

Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. This page provides an introduction to the idea of components. You can find a [detailed component API reference here](https://reactjs.org/docs/react-component.html).

Conceptually, components are like JavaScript functions. They accept arbitrary inputs \(called “props”\) and return React elements describing what should appear on the screen.

### Function and Class Components <a id="function-and-class-components"></a>

The simplest way to define a component is to write a JavaScript function:

```text
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

This function is a valid React component because it accepts a single “props” \(which stands for properties\) object argument with data and returns a React element. We call such components “function components” because they are literally JavaScript functions.

You can also use an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) to define a component:

```text
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

The above two components are equivalent from React’s point of view.

Function and Class components both have some additional features that we will discuss in the [next sections](https://reactjs.org/docs/state-and-lifecycle.html).

### Rendering a Component <a id="rendering-a-component"></a>

Previously, we only encountered React elements that represent DOM tags:

```text
const element = <div />;
```

However, elements can also represent user-defined components:

```text
const element = <Welcome name="Sara" />;
```

When React sees an element representing a user-defined component, it passes JSX attributes and children to this component as a single object. We call this object “props”.

For example, this code renders “Hello, Sara” on the page:

```text
function Welcome(props) {  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;ReactDOM.render(
  element,
  document.getElementById('root')
);
```

[**Try it on CodePen**](https://reactjs.org/redirect-to-codepen/components-and-props/rendering-a-component)

Let’s recap what happens in this example:

1. We call `ReactDOM.render()` with the `<Welcome name="Sara" />` element.
2. React calls the `Welcome` component with `{name: 'Sara'}` as the props.
3. Our `Welcome` component returns a `<h1>Hello, Sara</h1>` element as the result.
4. React DOM efficiently updates the DOM to match `<h1>Hello, Sara</h1>`.

> **Note:** Always start component names with a capital letter.
>
> React treats components starting with lowercase letters as DOM tags. For example, `<div />` represents an HTML div tag, but `<Welcome />` represents a component and requires `Welcome` to be in scope.
>
> To learn more about the reasoning behind this convention, please read [JSX In Depth](https://reactjs.org/docs/jsx-in-depth.html#user-defined-components-must-be-capitalized).

### Composing Components <a id="composing-components"></a>

Components can refer to other components in their output. This lets us use the same component abstraction for any level of detail. A button, a form, a dialog, a screen: in React apps, all those are commonly expressed as components.

For example, we can create an `App` component that renders `Welcome` many times:

```text
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />      <Welcome name="Cahal" />      <Welcome name="Edite" />    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

[**Try it on CodePen**](https://reactjs.org/redirect-to-codepen/components-and-props/composing-components)

Typically, new React apps have a single `App` component at the very top. However, if you integrate React into an existing app, you might start bottom-up with a small component like `Button` and gradually work your way to the top of the view hierarchy.

### Extracting Components <a id="extracting-components"></a>

Don’t be afraid to split components into smaller components.

For example, consider this `Comment` component:

```text
function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <img className="Avatar"
          src={props.author.avatarUrl}
          alt={props.author.name}
        />
        <div className="UserInfo-name">
          {props.author.name}
        </div>
      </div>
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```

[**Try it on CodePen**](https://reactjs.org/redirect-to-codepen/components-and-props/extracting-components)

It accepts `author` \(an object\), `text` \(a string\), and `date` \(a date\) as props, and describes a comment on a social media website.

This component can be tricky to change because of all the nesting, and it is also hard to reuse individual parts of it. Let’s extract a few components from it.

First, we will extract `Avatar`:

```text
function Avatar(props) {
  return (
    <img className="Avatar"      src={props.user.avatarUrl}      alt={props.user.name}    />  );
}
```

The `Avatar` doesn’t need to know that it is being rendered inside a `Comment`. This is why we have given its prop a more generic name: `user` rather than `author`.

We recommend naming props from the component’s own point of view rather than the context in which it is being used.

We can now simplify `Comment` a tiny bit:

```text
function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <Avatar user={props.author} />        <div className="UserInfo-name">
          {props.author.name}
        </div>
      </div>
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```

Next, we will extract a `UserInfo` component that renders an `Avatar` next to the user’s name:

```text
function UserInfo(props) {
  return (
    <div className="UserInfo">      <Avatar user={props.user} />      <div className="UserInfo-name">        {props.user.name}      </div>    </div>  );
}
```

This lets us simplify `Comment` even further:

```text
function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}
```

[**Try it on CodePen**](https://reactjs.org/redirect-to-codepen/components-and-props/extracting-components-continued)

Extracting components might seem like grunt work at first, but having a palette of reusable components pays off in larger apps. A good rule of thumb is that if a part of your UI is used several times \(`Button`, `Panel`, `Avatar`\), or is complex enough on its own \(`App`, `FeedStory`, `Comment`\), it is a good candidate to be extracted to a separate component.

### Props are Read-Only <a id="props-are-read-only"></a>

Whether you declare a component [as a function or a class](https://reactjs.org/docs/components-and-props.html#function-and-class-components), it must never modify its own props. Consider this `sum` function:

```text
function sum(a, b) {
  return a + b;
}
```

Such functions are called [“pure”](https://en.wikipedia.org/wiki/Pure_function) because they do not attempt to change their inputs, and always return the same result for the same inputs.

In contrast, this function is impure because it changes its own input:

```text
function withdraw(account, amount) {
  account.total -= amount;
}
```

React is pretty flexible but it has a single strict rule:

**All React components must act like pure functions with respect to their props.**

Of course, application UIs are dynamic and change over time. In the [next section](https://reactjs.org/docs/state-and-lifecycle.html), we will introduce a new concept of “state”. State allows React components to change their output over time in response to user actions, network responses, and anything else, without violating this rule.
