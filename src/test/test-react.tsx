import * as React from "react";
import { render } from "react-dom";

function App() {
  return (
    <div>
      <h1>Using useService hook in the react Component</h1>
      <div>
        <p>{`
          This is an example project of how to use useService hook in react components using
          as-service library. The idea is that most of the projects need state management can 
          replace it. useService hook returns data,state,error and retry function for calling 
          inside componend handler functions.
          
        `}</p>
        <p>
          <a href="https://codesandbox.io/s/upbeat-meitner-l6szm">
            Open this in codesandbox
          </a>{" "}
          to play around with things. You can also use the codesandbox to
          contribute to{" "}
          <a href="https://github.com/barteh/as-service">
            the project on GitHub
          </a>
          !
        </p>
      </div>
    </div>
  );
}

render(<App />, document.getElementById("root"));
