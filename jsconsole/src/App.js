import React, { useRef } from "react";
import "./App.css";
import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";
import Interpreter from "./interpreter";
import Visitor from "./visitor";
// const l = console.log;
const acorn = require("acorn");
// pull in the cmd line ar

const App = () => {
  let [inputValue, setInputValue] = React.useState("");
  let [prevData, setPrevData] = React.useState([]);
  let [inputValueHistory, setInputValueHistory] = React.useState([]);
  let recentValues = [];
  let pos = useRef(0);

  const inputRef = useRef(null);
  let Value = inputRef.current;
  const updateInputValue = () => {
    setInputValue(inputRef.current.value);
  };

  React.useEffect(() => {
    const Observable$ = fromEvent(Value, "keyup").pipe(
      filter((e) => e.keyCode === 13 && !e.shiftKey)
    );

    if (Value !== null || undefined) {
      Observable$.subscribe((e) => {
        e.preventDefault();
      });

      const getPreviousData = (element, arrow_func) =>
        fromEvent(element, "keyup").pipe(filter((e) => e.key === arrow_func));

      let clickArrowUp = getPreviousData(Value, "ArrowUp");
      let clickArrowDown = getPreviousData(
        Value,
        "ArrowDown"
      );

      clickArrowUp.subscribe(() => {
        if (recentValues.length > 0 && pos.current >= 0) {
          setInputValue(
            recentValues[pos.current] ? recentValues[pos.current] : ""
          );
          pos.current = pos.current - 1;
        }
      });

      clickArrowDown.subscribe(() => {
        if (recentValues.length > 0 && pos.current < recentValues.length) {
          setInputValue(
            recentValues[pos.current] ? recentValues[pos.current] : ""
          );
          pos.current = pos.current + 1;
        }
      });
    }
  });

  const interpretJsCode = (event) => {
    // pull in the cmd line args
    console.log("Event", prevData);
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      //const args = process.argv[2];
      const value = inputRef.current.value.trim();
      console.log("value", value);
      let eValue = "";
      if (value) {
        if (!/(var|let|const)/.test(value)) {
          eValue = `print(${value})`;
        }
        try {
          const body = acorn.parse(eValue || value, { ecmaVersion: 2020 }).body;
          console.log("body", body);
          const jsInterpreter = new Interpreter(new Visitor());
          jsInterpreter.interpret(body);
          const answer = jsInterpreter.getValue();
          console.log("answer", answer);
          const finalResult = answer ? value + "    =  " + answer : value;
          console.log("finalResult", finalResult);
          setPrevData((prevHistory) => [...prevHistory, finalResult]);
          setInputValueHistory((prevValue) => [...prevValue, value]);
          recentValues.push(...inputValueHistory, value);
          console.log("finalResult", recentValues);
          pos.current = recentValues.length; // intermiediatary
          setInputValue("");
        } catch {}
      }
    }
  };

  const showPrevData = (item, index) => (
    <div key={index} style={{ height: "45px", textAlign: "left" }}>
      <span style={{ color: "red" }}>{"> "}</span>
      {item}
    </div>
  );

  return (
    <div className="App">
      <div>{prevData.length > 0 && prevData.map(showPrevData)}</div>
      <div className="valueDiv">
        <span className="valueSpan">{">"}</span>
        <textarea
          className="valueText"
          ref={inputRef}
          value={inputValue}
          onChange={updateInputValue}
          onKeyDown={interpretJsCode}
          style={{ width: "100%", height: "30px" }}
          autoFocus
        />
      </div>
    </div>
  );
};

export default App;
