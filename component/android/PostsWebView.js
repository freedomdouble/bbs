'use strict';

import React, { Component } from 'react';
import {
    View,
    WebView,
} from 'react-native';

export default class PostsWebView extends Component {

    constructor(props) {

        super(props);

        this.state = { webViewHeight: 0 };
    }

    render() {

        let htmlContent = this.props.webContent;

        let script = `
            <script type="text/javascript">
                ;(function() {
                var wrapper = document.createElement("div");
                wrapper.id = "height-wrapper";
                while (document.body.firstChild) {
                    wrapper.appendChild(document.body.firstChild);
                }
                document.body.appendChild(wrapper);
                var i = 0;
                function updateHeight() {
                    document.title = wrapper.clientHeight;
                    window.location.hash = ++i;
                }
                window.addEventListener("load", function() {
                    updateHeight();
                });
                window.addEventListener("resize", updateHeight);
                }());
            </script>
        `;

        let html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/
                    <title></title>
                    <style type="text/css">
                        body, html, #height-wrapper {margin: 0;padding: 0;}
                        #height-wrapper {position: absolute; top: 0; left: 0; right: 0; padding: 0 12px;}
                        p{line-height: 1.8em;word-break: break-all;text-align: justify;}
						li {line-height: 1.6em;word-break: break-all;text-align: justify;}
						blockquote {display: block;border-left: 8px solid #d0e5f2;padding: 5px 10px;margin: 10px 0;line-height: 1.4;font-size: 100%;background-color: #f1f1f1;}
                    </style>
                </head>
                <body>
                ${htmlContent}
                ${script}
                </body>
            </html>
        `;

        return (
            <View style={{ flex: 1, height: this.state.webViewHeight }}>
                <WebView
                    source={{ html: html }}
                    style={{ flex: 1 }}
                    scrollEnabled={false}
                    automaticallyAdjustContentInsets={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    startInLoadingState={false}
                    scalesPageToFit={true}
                    onNavigationStateChange={(navState) => {
                        if (navState.title) {
                            const webViewHeight = parseInt(navState.title, 10) || 0; // turn NaN to 0
                            this.setState({ webViewHeight });
                        }
                    }}
                >
                </WebView>
            </View>
        );
    }
}
