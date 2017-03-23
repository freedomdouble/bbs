'use strict'

import React, { Component } from 'react';
import {
    View,
    StatusBar,
    Text,
    TouchableHighlight,
    ScrollView,
    Image as DefaulImage,
    Dimensions,
    Modal,
    ListView,
    TextInput,
    StyleSheet,
    ToastAndroid,
    AsyncStorage,
    BackAndroid
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import Image from 'react-native-image-zoom';
import { NavigationActions } from 'react-navigation';

const ScreenW = Dimensions.get('window').width;
const ScreenH = Dimensions.get('window').height;
const imgW = Math.round((ScreenW - 32) / 5);

export default class DynamicPublish extends Component {

    constructor(props) {

        super(props);

        this.state = {
            isVisible: false,
            visible: false,
            locationVisible: false,
            imageViewPos: 0,
            content: '',
            imageView: [],
            addrs: [],
            longitude: '',
            latitude: '',
            address: ''
        };

        this.submited = false;
        this.user = null;
        this.scrollView = {};
    }

    componentWillMount() {
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        dismissKeyboard();
        this.props.navigation.goBack(null);
        return true;
    }

    async componentDidMount() {

        try {
            const user = await AsyncStorage.getItem('user');
            if (user !== null) {
                this.user = JSON.parse(user);
            }
        } catch (error) {
            ToastAndroid.show('存储异常', ToastAndroid.SHORT);
        }
    }

    // 发布动态
    async _onPressSubmit() {

        if (this.state.content == '') {
            ToastAndroid.show('请输入内容', ToastAndroid.SHORT); return;
        }

        // 隐藏输入键盘
        dismissKeyboard();

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('content', this.state.content);
        data.append('imgs', JSON.stringify(this.state.imageView));
        data.append('longitude', this.state.longitude);
        data.append('latitude', this.state.latitude);
        data.append('address', this.state.address);

        try {
            let response = await fetch('http://121.11.71.33:8081/api/dynamic/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.user == null ? null : this.user.token
                },
                body: data
            });

            var result = await response.json();
        } catch (error) {
            this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == -1) {
            this.submited = false;
            return;
        }

        if (result.status == 0) {
            this.props.navigation.navigate('Login');
            return;
        }

        if (result.status == 1) {
            const navigationAction = NavigationActions.navigate({
                routeName: 'Home',
                params: {},
                action: NavigationActions.navigate({ routeName: 'Dynamic' })
            });

            this.props.navigation.dispatch(navigationAction);
            return;
        }
    }

    // 拍摄照片
    _onPressTakePhoto() {

        if (this.state.imageView.length >= 9) {
            ToastAndroid.show('图片已达上限', ToastAndroid.SHORT);
            return;
        }

        this.setState({ isVisible: !this.state.isVisible });

        if (this.user == null) {
            this.props.navigation.navigate('Login');
            return;
        }

        ImagePicker.openCamera({
            cropping: false
        })
            .then(image => {
                this._zipImage(image);
            });
    }

    // 选择照片
    _onPerssSelectPhoto() {

        if (this.state.imageView.length >= 9) {
            ToastAndroid.show('图片已达上限', ToastAndroid.SHORT);
            return;
        }

        this.setState({ isVisible: !this.state.isVisible });

        if (this.user == null) {
            this.props.navigation.navigate('Login');
        }

        ImagePicker.openPicker({
            multiple: true
        })
            .then(images => {
                if (this.state.imageView.length + images.length > 9) {
                    ToastAndroid.show('还能上传' + (9 - this.state.imageView.length) + '张图片，请重新选择', ToastAndroid.SHORT);
                    return;
                }
                images.forEach((image, i) => {
                    this._zipImage(image);
                });
            });
    }

    // 压缩图片
    _zipImage(image) {

        let _this = this;

        let format = '';

        if (image.mime == 'image/jpeg') {
            format = 'JPEG';
        } else if (image.mime == 'image/png') {
            format = 'PNG';
        } else if (image.mime == 'image/gif') {
            _this._imageUp(image.path);
            return;
        } else {
            ToastAndroid.show('图片格式错误', ToastAndroid.SHORT);
            return;
        }

        // 压缩图片
        ImageResizer.createResizedImage(image.path, 768, 1024, format, 75, 0, null).then((resizedImageUri) => {
            _this._imageUp(resizedImageUri, image.mime);
        }).catch((err) => {
            ToastAndroid.show('图片处理错误', ToastAndroid.SHORT);
        });
    }

    // 上传图片
    async _imageUp(uri, mine) {

        let pos = uri.lastIndexOf('/');
        let name = uri.substr(pos + 1);

        let data = new FormData();

        data.append('image', { uri: uri, type: mine, name: name });
        data.append('tmp', 'tmp');

        try {
            let response = await fetch('http://121.11.71.33:8081/api/qiniu/imageup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.user.token
                },
                body: data
            });

            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 0) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }
        if (result.status == 1) {
            if (this.state.imageView.length < 9) {
                let imageView = this.state.imageView;
                imageView.push(result.url);
                this.setState({ imageView: imageView });
                return;
            }
        }
    }

    // 显示图片浏览
    showImgView(index) {
        this.setState({ imageViewPos: index, visible: !this.state.visible });
        setTimeout(() => this.scrollView.scrollTo({ x: index * ScreenW }, true), 0);
    }

    // 删除当前浏览的图片，如果全部删除则关掉图片浏览
    _onPressTrash() {
        let imageView = this.state.imageView;
        let imageViewPos = this.state.imageViewPos;

        // 删除当前元素
        imageView.splice(imageViewPos, 1);

        if (imageView.length == 1) {
            imageViewPos = 0;
        }
        else {
            imageViewPos = imageViewPos == 0 ? (imageViewPos + 1) : (imageViewPos - 1);
        }

        if (imageView.length <= 0) {
            this.setState({ imageViewPos: 0, visible: false });
        }
        else {
            this.setState({ imageView: imageView, imageViewPos: imageViewPos });
            setTimeout(() => this.scrollView.scrollTo({ x: imageViewPos * ScreenW }, true), 0);
        }
    }

    // 当一帧滚动结束的时候调用
    _onAnimationEnd(event) {
        // 1.计算水平方向偏移量
        let offsetX = event.nativeEvent.contentOffset.x
        // 2.计算当前页码
        let page = Math.round(offsetX / ScreenW);
        // 3.更新状态机,重新绘制UI
        this.setState({
            imageViewPos: page
        });
    }

    // 选择定位地址模态框
    _renderLocationModal() {

        let addrWraper = [];

        this.state.addrs.forEach((addr, i) => {
            addrWraper.push(
                <TouchableHighlight key={i} underlayColor="rgba(0,0,0,0.1)"
                    style={{ paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center' }}
                    onPress={() => {
                        this.setState({ address: addr, locationVisible: !this.state.locationVisible });
                    }}
                >
                    <Text style={{fontSize: 12}}>{addr}</Text>
                </TouchableHighlight>
            );
        });

        return (
            <Modal transparent={true} visible={this.state.locationVisible} onRequestClose={() => this.setState({ locationVisible: false })}>
                <StatusBar backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        {addrWraper}
                        <View style={{ height: 15, backgroundColor: '#eee' }} />
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 11, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' }}
                            onPress={() => this.setState({ longitude: '', latitude: '', address: '', addrs: [], locationVisible: !this.state.locationVisible })}
                        >
                            <Text style={{fontSize: 12}}>清除定位</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 11, alignItems: 'center' }}
                            onPress={() => this.setState({ locationVisible: !this.state.locationVisible })}
                        >
                            <Text style={{fontSize: 12}}>取消操作</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
    }

    // 根据经纬度定位
    async _getCurrentPosition(position) {

        let url = 'http://121.11.71.33:8081//api/default/location?longitude=' + position.coords.longitude + '&latitude=' + position.coords.latitude;

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.setState({ longitude: position.coords.longitude, latitude: position.coords.latitude, addrs: result.addrs, locationVisible: !this.state.locationVisible });
        }
    }

    render() {

        let _this = this;

        let imageWraper = [];
        let imageView = [];
        let imageViewBottom = [];

        _this.state.imageView.forEach(function (img, index) {

            imageWraper.push(
                <TouchableHighlight key={index} style={styles.cell_img} onPress={() => _this.showImgView(index)}>
                    <DefaulImage source={{ uri: img }} style={{ width: imgW, height: imgW }} />
                </TouchableHighlight>
            );

            imageView.push(
                <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image key={index} source={{ uri: img }} style={{ width: ScreenW, flex: 1, }} onTap={() => { }} onLoad={() => { }} />
                </View>
            );

            let style = _this.state.imageViewPos == index ? { fontSize: 22, color: '#fff' } : { fontSize: 20, color: '#7b7b7b' };

            imageViewBottom.push(
                <Text key={index} style={style}>&bull;</Text>
            );
        });

        return (

            <View style={{ flex: 1, backgroundColor: '#E5E5E3' }}>
                {/*定位选择模态框*/}
                {_this._renderLocationModal()}
                {/* 图片浏览 */}
                <Modal transparent={true} visible={_this.state.visible} onRequestClose={() => _this.setState({ visible: !_this.state.visible })}>
                    <View style={{ flex: 1, backgroundColor: '#000', width: ScreenW, height: ScreenH }}>
                        {/* 状态栏 */}
                        <StatusBar backgroundColor="#000" barStyle="light-content" />
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                style={{ width: ScreenW }}
                                horizontal={true}
                                pagingEnabled={true}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                onMomentumScrollEnd={_this._onAnimationEnd.bind(_this)}
                                ref={(scrollView) => { _this.scrollView = scrollView; }}
                            >
                                {imageView}
                            </ScrollView>
                        </View>
                        {/* 工具栏 */}
                        <View style={{ flexDirection: 'row', height: 30, paddingHorizontal: 12 }}>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff' }}>{_this.state.imageViewPos + 1}/{_this.state.imageView.length}</Text></View>
                            <View style={styles.indicatorViewStyle}>{imageViewBottom}</View>
                            <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => _this._onPressTrash()}>
                                <Icon name="ios-trash-outline" size={22} color="#fff" />
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
                {/* 选择图片来源模态框 */}
                <Modal transparent={true} ref="modal" visible={_this.state.isVisible} onRequestClose={() => _this.setState({ isVisible: !_this.state.isVisible })}>
                    <StatusBar backgroundColor="#000" />
                    <View style={styles.modal_overlay}>
                        <View style={{ backgroundColor: '#fff', zIndex: 1000 }}>
                            <TouchableHighlight onPress={() => { _this._onPressTakePhoto() }} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={styles.modal_item1}>拍摄照片</Text>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={() => { _this._onPerssSelectPhoto() }} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={styles.modal_item2}>图库照片</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
                {/* 设置状态栏颜色 */}
                <StatusBar backgroundColor="#03c893" translucent={false} />
                {/* 导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893', justifyContent: 'space-between', paddingHorizontal: 5 }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => { dismissKeyboard(); _this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 5 }}>发布动态</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => _this._onPressSubmit()}>
                        <View>
                            <Text style={{ color: '#fff', fontSize: 16 }}>发表</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                {/*主体*/}
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    {/*内容输入框*/}
                    <View style={{ paddingHorizontal: 5, paddingVertical: 10, backgroundColor: '#E5E5E3' }}>
                        <TextInput
                            style={styles.text_input}
                            placeholderTextColor="#ccc"
                            underlineColorAndroid="rgba(0,0,0,0)"
                            placeholder="请在这里输入内容..."
                            multiline={true}
                            numberOfLines={4}
                            onChangeText={(text) => _this.setState({ content: text })}
                            value={_this.state.content}
                        />
                    </View>
                    {/*图片列表*/}
                    <View style={styles.img_list}>
                        {imageWraper}
                        <TouchableHighlight style={styles.cell_img} underlayColor="rgba(0,0,0,0.1)" onPress={() => _this.setState({ isVisible: !_this.state.isVisible })}>
                            <View style={styles.cell_img_view}>
                                <Icon name="ios-add" size={70} color="#E5E5E3" />
                            </View>
                        </TouchableHighlight>
                    </View>
                    {/*定位按钮*/}
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ marginTop: 10 }} onPress={() => {
                        if (this.state.addrs.length > 0) {
                            this.setState({ locationVisible: !this.state.locationVisible });
                            return;
                        }
                        ToastAndroid.show('定位中...', ToastAndroid.LONG)
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                this._getCurrentPosition(position);
                            },
                            (error) => ToastAndroid.show(JSON.stringify(error), ToastAndroid.SHORT),
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                        );
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, backgroundColor: '#fff', marginHorizontal: 5 }}>
                            <Text style={{ flex: 1, fontSize: 14, color: '#222' }}><Icon name="md-pin" size={14} color="#ccc" />  {this.state.address == '' ? '定位' : this.state.address}</Text>
                            <Icon name="ios-arrow-forward-outline" size={20} color="#E5E5E3" />
                        </View>
                    </TouchableHighlight>
                </ScrollView>
            </View>
        );
    }
}

let styles = StyleSheet.create({

    cell_img: {
        marginRight: 3,
        marginBottom: 3,
        width: imgW,
        height: imgW
    },

    cell_img_view: {
        width: imgW,
        height: imgW,
        borderWidth: 1,
        borderColor: '#E5E5E3',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_overlay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: ScreenW,
        height: ScreenH,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modal_item1: {
        color: '#222',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
        paddingHorizontal: 60,
        paddingVertical: 14
    },

    modal_item2: {
        color: '#222',
        paddingHorizontal: 60,
        paddingVertical: 14
    },

    text_input: {
        fontSize: 14,
        backgroundColor: '#fff'
    },

    img_list: {
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        marginHorizontal: 5,
    },

    indicatorViewStyle: {
        flex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

});
