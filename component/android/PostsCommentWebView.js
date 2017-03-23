'use strict';

import React, { Component } from 'react';
import {
    View,
    WebView,
} from 'react-native';

export default class PostsCommentWebView extends Component {

    constructor(props) {
        
        super(props);

        this.state = { webHeight: 0 };
    }

    render() {

        let _this = this;
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
                        #height-wrapper {position: absolute; top: 0; left: 0; right: 0;}
                        p {line-height: 1.8em;word-break: break-all;text-align: justify;}
                    </style>
                </head>
                <body>
                ${htmlContent}
                ${script}
                </body>
            </html>
        `;

        return (
            <WebView
                source={{ html: html }}
                style={{ height: this.state.webHeight }}
                scrollEnabled={false}
                automaticallyAdjustContentInsets={true}
                domStorageEnabled={true}
                decelerationRate="normal"
                startInLoadingState={false}
                javaScriptEnabled={true}
                onNavigationStateChange={(navState) => {
                    if (navState.title) {
                        const webHeight = parseInt(navState.title, 10) || 0; // turn NaN to 0
                        this.setState({ webHeight });
                    }
                }}
            >
            </WebView>
        );
    }
}
