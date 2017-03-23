'use strict';

import React, { Component } from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet, StatusBar, BackAndroid } from 'react-native';
import ImageViewItem from './ImageViewItem';

const ScreenW = Dimensions.get('window').width;
const ScreenH = Dimensions.get('window').height;

export default class ImageView extends Component {

    constructor(props) {

        super(props);
        this.scrollView = {};
        this.state = { currPos: this.props.navigation.state.params.currPos, hidden: false };
    }

    componentWillMount() {

        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);

        setTimeout(() => this.scrollView.scrollTo({ x: (this.state.currPos) * ScreenW }, true), 0);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        this.setState({ hidden: false });
        this.props.navigation.goBack(null);
        return true;
    }

    componentDidMount() {
        this.setState({ hidden: true });
    }

    // 当一帧滚动结束的时候调用
    onAnimationEnd(event) {
        // 1.计算水平方向偏移量
        let offsetX = event.nativeEvent.contentOffset.x
        // 2.计算当前页码
        let page = Math.round(offsetX / ScreenW);
        // 3.更新状态机,重新绘制UI
        this.setState({
            currPos: page
        });
    }

    render() {

        let imagesWraper = [];
        let footer = [];

        this.props.navigation.state.params.images.forEach((image, i) => {

            let style = this.state.currPos == i ? { fontSize: 22, color: '#fff' } : { fontSize: 20, color: '#7b7b7b' };

            footer.push(
                <Text key={i} style={style}>&bull;</Text>
            );

            imagesWraper.push(
                <View key={i} style={{ height: ScreenH, width: ScreenW }}>
                    <ImageViewItem uri={image} />
                </View>
            );
        });

        return (
            <View style={{ flex: 1 }}>
                <StatusBar backgroundColor='#03c893' hidden={this.state.hidden} animated={true} barStyle="dark-content" />
                <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                    style={{ width: ScreenW, height: ScreenH }}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollEnd={this.onAnimationEnd.bind(this)}
                    ref={(scrollView) => { this.scrollView = scrollView; }}
                >
                    {imagesWraper}
                </ScrollView>
                <View style={styles.indicatorViewStyle}>
                    {footer.length == 1 ? null : footer}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    // 分页指示器样式
    indicatorViewStyle: {
        backgroundColor: '#000',
        flexDirection: 'row',
        width: ScreenW,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20
    },

});