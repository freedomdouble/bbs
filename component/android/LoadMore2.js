'use strict';

import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class LoadMore2 extends Component {

    constructor(props) {

        super(props);
    }

    render() {

        let body = null;

        if (this.props.loadMoreFlag == 1) {
            body = (
                <View style={{
                    alignItems: 'center', paddingVertical: 14, backgroundColor: this.props.bgcolor,
                    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc'
                }}>
                    <Text style={{ color: '#666', fontSize: 12 }}>正在加载...</Text>
                </View>
            );
        }

        if (this.props.loadMoreFlag == 2) {
            body = (
                <View style={{
                    alignItems: 'center', paddingVertical: 14, backgroundColor: this.props.bgcolor,
                    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc'
                }}>
                    <Text style={{ color: '#666', fontSize: 12 }}>就这么多了...</Text>
                </View>
            );
        }

        return body;
    }
}
