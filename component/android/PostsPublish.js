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

export default class PostsPublish extends Component {

    constructor(props) {

        super(props);

        this.state = {
            isVisible: false,
            visible: false,
            catesVisible: false,
            tagsVisible: false,
            imageViewPos: 0,
            title: '',
            content: '',
            imageView: [],
            cate_name: '选择分类',
            tag_name: '选择标签',
            cates: [{ title: '选择分类', associated_id: 0 }],
            tags: [{ id: '0', tag_name: '选择标签' }]
        };

        this.submited = false;
        this.user = null;
        this.scrollView = {};
        this.cate_id = 0;
        this.tag_id = 0;
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

        this._fetchCatesData();
    }

    // 获取分类列表
    async _fetchCatesData() {

        let url = 'http://121.11.71.33:8081/api/recommend/list?unique=appluntanfenlei';

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
            let _cates = result.list;
            _cates.unshift({ title: '选择分类', associated_id: 0 });
            this.setState({ cates: _cates });
        }
    }

    /**
     * 获取分类下的标签列表
     */
    async _fetchTagsData() {

        let url = 'http://121.11.71.33:8081/api/posts/tags?id=' + this.cate_id;

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        console.log(result);

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            let _tag = result.list;
            _tag.unshift({ id: 0, tag_name: '选择标签' });
            this.setState({ tags: _tag });
        }
    }

    // 发布帖子
    async _onPressSubmit() {

        if (this.state.title == '') {
            ToastAndroid.show('请输入标题', ToastAndroid.SHORT); return;
        }
        if (this.state.content == '') {
            ToastAndroid.show('请输入内容', ToastAndroid.SHORT); return;
        }
        if (this.cate_id == 0) {
            ToastAndroid.show('请选择分类', ToastAndroid.SHORT); return;
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
        data.append('title', this.state.title);
        data.append('content', this.state.content);
        data.append('images', JSON.stringify(this.state.imageView));
        data.append('cate_id', this.cate_id);
        data.append('tag_id', this.tag_id);

        try {
            let response = await fetch('http://121.11.71.33:8081/api/posts/publish', {
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
                action: NavigationActions.navigate({ routeName: 'Discuz' })
            });

            this.props.navigation.dispatch(navigationAction);
            return;
        }
    }

    // 拍摄照片
    _onPressTakePhoto() {

        let _this = this;

        _this.setState({ isVisible: !_this.state.isVisible });

        if (_this.user == null) {
            _this.props.navigation.navigate('Login');
            return;
        }

        ImagePicker.openCamera({
            cropping: false
        })
            .then(image => {
                _this._zipImage(image);
            });
    }

    // 选择照片
    _onPerssSelectPhoto() {

        let _this = this;

        _this.setState({ isVisible: !_this.state.isVisible });

        if (_this.user == null) {
            _this.props.navigation.navigate('Login');
        }

        ImagePicker.openPicker({
            multiple: true
        })
            .then(images => {
                images.forEach((image, i) => {
                    _this._zipImage(image);
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
        ImageResizer.createResizedImage(image.path, 768, 1024, format, 80, 0, null).then((resizedImageUri) => {
            _this._imageUp(resizedImageUri, image.mime);
        }).catch((err) => {
            ToastAndroid.show('图片处理错误', ToastAndroid.SHORT);
        });
    }

    // 上传图片
    async _imageUp(uri, mine) {

        let _this = this;

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
                    'Authorization': _this.user.token
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
            _this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }
        if (result.status == 1) {
            let imageView = _this.state.imageView;
            imageView.push(result.url);
            _this.setState({ imageView: imageView });
            return;
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

    // 选择分类模态框
    _renderCatesModal() {

        let catesWraper = [];
        let itemWidth = ScreenW / 4;

        this.state.cates.forEach((cate, i) => {
            catesWraper.push(
                <TouchableHighlight key={i} underlayColor="rgba(0,0,0,0.1)"
                    style={{ height: 50, width: itemWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => {
                        if (cate.associated_id == this.cate_id) {
                            this.setState({ catesVisible: !this.state.catesVisible });
                        } else {
                            this.cate_id = cate.associated_id;
                            this.tag_id = 0;
                            this.setState({ catesVisible: !this.state.catesVisible, cate_name: cate.title, tag_name: '选择标签', tags: [] });
                            this._fetchTagsData();
                        }
                    }}>
                    <Text>{cate.title}</Text>
                </TouchableHighlight>
            );
        });

        return (
            <Modal transparent={true} visible={this.state.catesVisible} onRequestClose={() => this.setState({ catesVisible: false })}>
                <StatusBar backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {catesWraper}
                        </View>
                        <View style={{ height: 15, backgroundColor: '#eee' }} />
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)" style={{ paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => this.setState({ catesVisible: !this.state.catesVisible })}
                        >
                            <Text>取消选择</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
    }

    // 选择标签模态框
    _renderTagsModal() {

        let tagsWraper = [];

        this.state.tags.forEach((tag, i) => {
            tagsWraper.push(
                <TouchableHighlight
                    key={i}
                    underlayColor="rgba(0,0,0,0.1)"
                    style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center' }}
                    onPress={() => {
                        this.tag_id = tag.id;
                        this.setState({ tagsVisible: !this.state.tagsVisible, tag_name: tag.tag_name });
                    }}
                >
                    <Text>{tag.tag_name}</Text>
                </TouchableHighlight>
            );
        });

        return (
            <Modal transparent={true} visible={this.state.tagsVisible} onRequestClose={() => this.setState({ tagsVisible: false })}>
                <StatusBar backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        {tagsWraper}
                        <View style={{ height: 15, backgroundColor: '#eee' }} />
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => this.setState({ tagsVisible: !this.state.tagsVisible })}
                        >
                            <Text>取消选择</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
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
                {/* 选择分类模态框 */}
                {_this._renderCatesModal()}
                {/*标签选择模态框*/}
                {_this._renderTagsModal()}
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
                <StatusBar backgroundColor="#03c893" />
                {/* 导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893', justifyContent: 'space-between', paddingHorizontal: 5 }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => { dismissKeyboard(); _this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 5 }}>发布帖子</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => _this._onPressSubmit()}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: '#fff', fontSize: 14 }}>确定发布</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                {/*主体*/}
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    {/*分类和标签*/}
                    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 5, marginTop: 10 }}>
                        <TouchableHighlight style={{ flex: 1 }} underlayColor="rgba(0,0,0,0.1)" onPress={() => _this.setState({ catesVisible: !_this.state.catesVisible })}>
                            <View style={{ flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: '#eee' }}>
                                <Text style={{ color: this.cate_id == 0 ? '#ccc' : '#222' }}>{_this.state.cate_name}</Text>
                                <Icon name="ios-arrow-down-outline" size={16} color={this.cate_id == 0 ? '#ccc' : '#222'} style={{ marginTop: 2 }} />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ flex: 1 }} underlayColor="rgba(0,0,0,0.1)" onPress={() => _this.setState({ tagsVisible: !_this.state.tagsVisible })}>
                            <View style={{ flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: this.tag_id == 0 ? '#ccc' : '#222' }}>{_this.state.tag_name}</Text>
                                <Icon name="ios-arrow-down-outline" size={16} color={this.tag_id == 0 ? '#ccc' : '#222'} style={{ marginTop: 2 }} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    {/*标题输入框*/}
                    <View style={{ paddingHorizontal: 5, paddingTop: 10, backgroundColor: '#E5E5E3' }}>
                        <TextInput
                            style={styles.text_input}
                            placeholderTextColor="#ccc"
                            underlineColorAndroid="rgba(0,0,0,0)"
                            placeholder="请在这里输入标题..."
                            multiline={true}
                            numberOfLines={1}
                            onChangeText={(text) => _this.setState({ title: text })}
                            value={_this.state.title}
                        />
                    </View>
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
        marginHorizontal: 5
    },

    indicatorViewStyle: {
        flex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

});
