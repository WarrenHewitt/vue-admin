<template>
    <div class="login-part">
        <el-row type="flex" justify="center">
            <el-col :span="5">
                <el-form :model="formData" :rules="rules" ref="formLogin">
                    <el-form-item prop="username">
                        <el-input type="text" v-model="formData.username" placeholder="username"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input :type="eyeStatus ? 'text' : 'password'" v-model="formData.password" placeholder="password"></el-input>
                        <div :class="eyeStatus? 'eye-open': 'eye-close'" @click="handleEye"></div>
                    </el-form-item>
                    <el-checkbox class="auto-login" v-model="rememberPassword">remember login</el-checkbox>
                    <el-form-item>
                        <el-button style="width:100%" type="primary" @click="submitForm">Login</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button style="width:100%" type="primary" @click="reset">reset</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <a href="/static"></a>
        <div style="color: #fff; text-align: center">
            {{ MD5SHA1 }}
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie'
import { mapState, mapActions } from 'vuex'
import {
    reqLogin,
// reqUserInfo
} from '@/api/user/user.js'
import CryptoJS from 'crypto-js'

export default {
    comments: {
    },
    data () {
        return {
            rememberPassword: false,
            MD5SHA1: '',
            eyeStatus: false,
            formData: {
                username: 'hew',
                password: '123456'
            },
            rules: {
                username: [
                    { required: true, message: 'please enter username', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'please enter password', trigger: 'blur' }
                ]
            }
        }
    },

    created () {
        this.autoLogin()

        this.actionSetModule('测试')
    },

    computed: {
        ...mapState(['projectName', 'someKey'])
    },

    watch: {
        'formData.password' (v) {
            if (v) {
                this.MD5SHA1 = CryptoJS.SHA1(CryptoJS.MD5(v).toString()).toString()
            } else {
                this.MD5SHA1 = ''
            }
        }
    },

    methods: {
        ...mapActions(['actionSetProjectName']),
        ...mapActions('user', ['actionSetModule']),

        handleEye () {
            this.eyeStatus = !this.eyeStatus
        },

        autoLogin () {
            if (Cookies.get('token')) {
                this.$router.push({ path: '/' })
            } else {
                this.setNamePassword()
            }
        },

        setNamePassword () {
            const remember = Cookies.get('login')
            if (remember) {
                const np = decodeURIComponent(remember).split('&')
                this.formData.password = np[0]
                this.formData.username = np[1]
                this.rememberPassword = true
            }
        },

        submitForm () {
            this.$refs.formLogin.validate((valid) => {
                if (valid) {
                    const { rememberPassword, formData: { username, password } } = this
                    reqLogin({ username, password })
                        .then(({ code, data }) => {
                            const { token } = data
                            Cookies.set('token', token)
                            if (rememberPassword) {
                                Cookies.set('login', encodeURIComponent(`${password}&${username}`))
                            } else {
                                Cookies.set('login', '')
                            }
                            this.$router.push({ path: '/' })
                        }).catch((err) => {
                            console.error('error in login page:', err)
                        })
                } else {
                    console.error('error submit!!')
                    return false
                }
            })
        },
        reset () {
            Object.assign(this.$data, this.$options.data())
        }
    }
}
</script>

<style type="text/scss" lang="scss" scoped>
@import '@/styles/login/login.scss';
</style>
