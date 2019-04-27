import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import fetch from "isomorphic-fetch";
import React, { Component } from "react";
import "./App.css";
import logo from "./logo.svg";

const ipcRenderer = (window as any).isInElectronRenderer
        ? (window as any).nodeRequire("electron").ipcRenderer
        : (window as any).ipcRendererStub;

interface IOwnProps {} // tslint:disable-line

class App extends Component<IOwnProps> {

    public resultDiv:HTMLDivElement | null = null;

    private apiPort = 5000;
    private apiSigningKey = "";

    private appGlobalClient = null as unknown as ApolloClient<NormalizedCacheObject>;

    constructor(props:IOwnProps) {
        super(props);
        if (ipcRenderer) {
            ipcRenderer.on("apiDetails", ({}, argString:string) => {
                const arg:{ port:number, signingKey:string } = JSON.parse(argString);
                this.apiPort = arg.port;
                this.apiSigningKey = arg.signingKey;
                this.appGlobalClient = new ApolloClient({
                    cache: new InMemoryCache(),
                    link: new HttpLink({
                        fetch:(fetch as any),
                        uri: "http://127.0.0.1:" + this.apiPort + "/graphql/",
                    }),
                });
            });
            ipcRenderer.send("getApiDetails");
        }
    }

    public render() {
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
                        onKeyDown={this.handleKeyDown}
                    />
                    <div ref={(elem) => this.resultDiv = elem}/>
                </header>
            </div>
        );
    }

    private handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const math = event.currentTarget.value;
            if (ipcRenderer === null || ipcRenderer === undefined || this.appGlobalClient === null) { // tslint:disable-line
                this.resultDiv!.textContent = "this page only works when hosted in electron";
                return;
            }
            this.appGlobalClient.query({
                query:gql`query calc($signingkey:String!, $math:String!) {
                    calc(signingkey:$signingkey, math:$math)
                }`,
                variables: {
                    math,
                    signingkey: this.apiSigningKey,
                },
            })
                .then(({ data }) => {
                    this.resultDiv!.textContent = data.calc;
                })
                .catch((e) => {
                    console.log("Error contacting graphql server");
                    console.log(e);
                    this.resultDiv!.textContent = "Error getting result with port=" + this.apiPort + " and signingkey='" + this.apiSigningKey + "'";
                });
        }
    }
}

export default App;
