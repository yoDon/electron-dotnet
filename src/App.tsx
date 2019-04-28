import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import fetch from "isomorphic-fetch";
import React, { useMemo, useState } from "react";
import "./App.css";
import logo from "./logo.svg";

const ipcRenderer = (window as any).isInElectronRenderer
        ? (window as any).nodeRequire("electron").ipcRenderer
        : (window as any).ipcRendererStub;

const App = () => {
    const [mathResult, setMathResult] = useState("");
    const [apiPort, setApiPort] = useState(0);
    const [apiSigningKey, setApiSigningKey] = useState("");

    const appGlobalClient = useMemo(() => {
        if (apiPort === 0) {
            if (ipcRenderer) {
                ipcRenderer.on("apiDetails", ({}, argString:string) => {
                    const arg:{ port:number, signingKey:string } = JSON.parse(argString);
                    setApiPort(arg.port); // setting apiPort causes useMemo'd appGlobalClient to be re-evaluated
                    setApiSigningKey(arg.signingKey);
                });
                ipcRenderer.send("getApiDetails");
            }
            return null;
        }
        return new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({
                fetch:(fetch as any),
                uri: "http://127.0.0.1:" + apiPort + "/graphql/",
            }),
        });
    }, [apiPort]);

    const handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const math = event.currentTarget.value;
            if (appGlobalClient === null) {
                setMathResult("this page only works when hosted in electron");
                return;
            }
            appGlobalClient.query({
                query:gql`query calc($signingkey:String!, $math:String!) {
                    calc(signingkey:$signingkey, math:$math)
                }`,
                variables: {
                    math,
                    signingkey: apiSigningKey,
                },
            })
            .then(({ data }) => {
                setMathResult(data.calc);
            })
            .catch((e) => {
                console.log("Error contacting graphql server");
                console.log(e);
                setMathResult("Error getting result with port=" + apiPort + " and signingkey='" + apiSigningKey + " (if this is the first call, the server may need a few seconds to initialize)");
            });
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <p>Input something like <code>1 + 1</code>.</p>
                <p>
                    This calculator supports <code>+-*/^()</code>,
                    whitespaces, and integers and floating numbers.
                </p>
                <input
                    style={{ color:"black" }}
                    onKeyDown={handleKeyDown}
                />
                <div>
                    {mathResult}
                </div>
            </header>
        </div>
    );
};

export default App;
