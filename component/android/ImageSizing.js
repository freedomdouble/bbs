'use strict';

import React, { Component } from 'react';
import { Image } from 'react-native';

export default class ImageSizing extends Component {

    constructor(props) {

        super(props);

        this.state = { width: 0, height: 0 };
    }

    componentWillMount() {
        Image.getSize(this.props.uri, (width, height) => {
            this.setState({ width, height });
        });
    }

    render() {

        let width = 0;
        let height = 0;

        if (this.state.width > this.props.width || this.state.height > this.props.height) {

            let w = this.state.width / this.props.width;
            let h = this.state.height / this.props.height;

            // 宽度和长度都要缩小
            if (w > 1 && h > 1) {
                if (w > h) {
                    width = this.props.width;
                    height = this.state.height / w;
                } else {
                    width = this.state.width / h;
                    height = this.props.height;
                }
            }
            // 宽度要缩小
            else if (w > 1 && h < 1) {
                width = this.props.width;
                height = this.state.height / w;
            }
            // 高度要缩小
            else if (w < 1 && h > 1) {
                width = this.state.width / h;
                height = this.state.height;
            }
            // 宽度和长度都不用缩小
            else {
                width = this.state.width;
                height = this.state.height;
            }

        } else {
            width = this.state.width;
            height = this.state.height;
        }

        return <Image source={{ uri: this.props.uri }} style={{ width: width, height: height }} resizeMode='stretch' />;
    }
}