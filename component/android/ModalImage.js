'use strict';

import React, { Component } from 'react';
import { View, Dimensions, ScrollView, StyleSheet, Text, StatusBar } from 'react-native';
import ImageSizing from './ImageSizing';

const ScreenW = Dimensions.get('window').width;
const ScreenH = Dimensions.get('window').height;

export default class ModalImage extends Component {

    constructor(props) {
        super(props);
        this.scrollView = {};
        this.state = { imagePos: this.props.imagePos };
    }

    componentWillMount() {

        setTimeout(() => this.scrollView.scrollTo({ x: (this.state.imagePos) * ScreenW }, true), 0);
    }

    render() {
        return (
            <View style={{ backgroundColor: '#000', width: ScreenW, height: ScreenH }}>

                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={{ width: ScreenW, height: ScreenH }}
                        horizontal={true}
                        pagingEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        onMomentumScrollEnd={this.onAnimationEnd.bind(this)}
                        ref={(scrollView) => { this.scrollView = scrollView; }}
                    >
                        {this.allImage()}
                    </ScrollView>
                    <View style={styles.indicatorViewStyle}>
                        {this.footer()}
                    </View>
                </View>
            </View>
        );
    }

    // 当一帧滚动结束的时候调用
    onAnimationEnd(event) {
        // 1.计算水平方向偏移量
        let offsetX = event.nativeEvent.contentOffset.x
        // 2.计算当前页码
        let page = Math.round(offsetX / ScreenW);
        // 3.更新状态机,重新绘制UI
        this.setState({
            imagePos: page
        });
    }

    // 圆点列表
    footer() {

        let footer = [];
        let curr = this.state.imagePos;

        this.props.images.forEach(function (img, i) {

            let style = curr == i ? { fontSize: 22, color: '#fff' } : { fontSize: 20, color: '#7b7b7b' };

            footer.push(
                <Text key={i} style={style}>&bull;</Text>
            );
        });

        return footer.length == 1 ? null : footer;
    }

    // 返回图片列表
    allImage() {

        let allImage = [];

        this.props.images.forEach(function (img, i) {
            allImage.push(
                <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: ScreenW }}>
                    <ImageSizing uri={img} width={ScreenW} height={ScreenH} />
                </View>
            );
        });

        return allImage;
    }
}

const styles = StyleSheet.create({
    // 分页指示器样式
    indicatorViewStyle: {
        flexDirection: 'row',
        width: ScreenW,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20
    },

});