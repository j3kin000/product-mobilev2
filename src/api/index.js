import axios from 'axios';
import {useState} from 'react';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGlobal} from '../../global/index';
import {Image as ImageCompress} from 'react-native-compressor';

//old link http://ec2-18-197-240-205.eu-central-1.compute.amazonaws.com:8000/gateway/v1/
//new link https://saas-gw-dev.milgam.co.il:433/gateway/v1/
//new dev link https://saas-gw-dev.milgam.co.il:8443/  https://saas-gw-dev.milgam.co.il:8012/
// qa link https://product-saas-gw-qa.milgam.co.il:8843/
// production link https://miltask-gw.milgam.co.il/"

const getEnv = async () => {
  const res = await AsyncStorage.getItem('envState');
  return res;
};

const getUrl = async () => {
  let val = await getEnv();
  // return val === 'DEV'
  //   ? 'https://saas-gw-dev.milgam.co.il:8012/'
  //   : val === 'QA'
  //   ? 'https://product-saas-gw-qa.milgam.co.il:8843/'
  //   : 'https://miltask-gw.milgam.co.il/';
  return "https://miltask-gw.milgam.co.il/"
};

export const userSignIn = async (username, password) => {
  console.log('userSignIn');
  const url = (await getUrl()) + 'auth/login';
  console.log('URLS', url);
  let response = await axios({
    method: 'post',
    url: url,
    data: {
      username: username,
      password: password,
    },
  });
  console.log('Response', response);
  return response;
};

export const getProfileInfo = async token => {
  try {
    const url = (await getUrl()) + 'auth/user';
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(`getProfileInfo error: `, error);
    return {};
  }
};

export const restoreIdToken = async refreshToken => {
  try {
    const url = (await getUrl()) + 'auth/token';
    let response = await axios({
      method: 'post',
      url: url,
      data: {},
    });
    return response.json();
  } catch (error) {
    console.log(`restoreIdToken error: `, error);
    return {};
  }
};

export const refresh = async refreshToken => {
  try {
    const url = (await getUrl()) + 'auth/refresh';
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        'x-refresh-token': refreshToken,
      },
    });
    return response;
  } catch (error) {
    console.log(`refresh error: `, error);
    return {};
  }
};

export const getTasksList = async token => {
  try {
    const url = (await getUrl()) + 'tasks?page=0&pageSize=2000';
    const tenant = await AsyncStorage.getItem('tenant');
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getTasksList error: `, error);
    return {};
  }
};

export const getSettings = async (token, tenant) => {
  try {
    const url = (await getUrl()) + 'settings'; // https://saas-gw-dev.milgam.co.il:8012/settings
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getSettings error: `, error);
    return {};
  }
};

export const getTaskTypes = async (token, tenant) => {
  try {
    const url = (await getUrl()) + 'task-types'; // https://saas-gw-dev.milgam.co.il:8012/settings
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getTaskTypes error: `, error);
    return {};
  }
};

export const getForms = async (token, tenant) => {
  try {
    const url = (await getUrl()) + 'forms'; // https://saas-gw-dev.milgam.co.il:8012/settings
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getForms error: `, error);
    return {};
  }
};

export const getTaskDetails = async (token, tenant) => {
  try {
    const url = (await getUrl()) + 'task-details'; // https://saas-gw-dev.milgam.co.il:8012/settings
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getTaskDetails error: `, error);
    return {};
  }
};

export const createNewTask = async (values, selectedType, token, tenant) => {
  try {
    const url = (await getUrl()) + `tasks`;
    let response = await axios({
      method: 'post',
      url: url,
      data: {
        ...values,
        // taskId: +id,
        taskType: selectedType,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });
    console.log('createNewTask response', response);
    return response;
  } catch (error) {
    console.log(`createNewTask error: `, error);
    console.log('createNewTask second error', error.response);
    return {};
  }
};

export const changeTaskStatus = async (taskId, idToken, wholeTask) => {
  console.log('ZZZ');
  try {
    const url = (await getUrl()) + `tasks/${taskId}`;
    const tenant = await AsyncStorage.getItem('tenant');
    let response = await axios({
      method: 'put',
      url: url,
      data: wholeTask,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'x-tenant-name': tenant,
      },
    });
    // console.log('changeTaskStatus response', response)
    return response;
  } catch (error) {
    console.log(`changeTaskStatus error: `, error.response.data);
    return {};
  }
};

export const getPhotoFromAmazon = async (token, presignedUrl) => {
  console.log('token', token);
  try {
    const url = (await getUrl()) + 'files/pre-signed-download';
    const tenant = await AsyncStorage.getItem('tenant');
    let response = await axios({
      method: 'post',
      url: url,
      data: {
        filePath: presignedUrl,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-name': tenant,
      },
    });
    response = response.data.presignedUrl;
    return response;
  } catch (error) {
    console.log('The path ' + presignedUrl + " isn't exsist");
    return {};
  }
};

export const uploadPhotoFromAmazon = async (
  //get the file and send with fetch
  token,
  taskIdAndFilePath,
  filePath,
) => {
  console.log('token', token);
  console.log('taskIdAndFilePath', taskIdAndFilePath);
  console.log('filePath', filePath);
  const url = (await getUrl()) + 'files/pre-signed-upload';
  const tenant = await AsyncStorage.getItem('tenant');
  try {
    let response = await axios({
      method: 'post',
      url: url,
      data: {
        filePath: taskIdAndFilePath,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-name': tenant,
      },
    });
    response = response.data.presignedUrl;
    const getBlob = async fileUri => {
      const resp = await fetch(fileUri);
      const imageBody = await resp.blob();
      return imageBody;
    };
    const uploadUsingPresignedUrl = async (preSignedUrl, dataObj) => {
      console.log('preSignedUrl', preSignedUrl);
      console.log('dataObj', dataObj);
      const imageBody = await getBlob(dataObj);
      console.log('imageBody', imageBody);
      const response = axios(preSignedUrl, {
        method: 'PUT',
        body: imageBody,
      });
      return response.data;
    };
    const imgCompress = await ImageCompress.compress(filePath, {
      maxWidth: 500,
      maxHeight: 500,
    });
    const responseFromAmazon = uploadUsingPresignedUrl(response, filePath);
    return responseFromAmazon;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getTaskStatus = async token => {
  try {
    const url = (await getUrl()) + 'task-statuses';
    const tenant = await AsyncStorage.getItem('tenant');
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });
    return response.data;
  } catch (error) {
    console.log(`getTaskStatus error: `, error);
    return {};
  }
};

export const getImageFromAmazon = async (IdToken, taskId, filename) => {
  try {
    const tenant = await AsyncStorage.getItem('tenant');
    const settings = await getSettings(IdToken, tenant);
    const getBucketName = settings.find(item => {
      return item.key == 'bucketName';
    });
    const getRegion = settings.find(item => {
      return item.key == 's3Region';
    });
    console.log('settings', getRegion.value);
    const presignedUrl =
      'https://' +
      getBucketName.value +
      '.s3.' +
      getRegion.value +
      '.amazonaws.com/' +
      taskId +
      '/' +
      filename;
    console.log('presignedUrl =', presignedUrl);
    const url = (await getUrl()) + 'files/pre-signed-download';

    let response = await axios({
      method: 'post',
      url: url,
      data: {
        filePath: presignedUrl,
      },
      headers: {
        Authorization: `Bearer ${IdToken}`,
        'Content-Type': 'application/json',
        'x-tenant-name': tenant,
      },
    });
    return await response.request._response;
  } catch (error) {
    console.log('The path ' + presignedUrl + " isn't exsist");
    return {};
  }
};

export const getGroupsUser = async (token, groupName) => {
  try {
    const tenant = await AsyncStorage.getItem('tenant');
    const url = (await getUrl()) + 'groups/group-with-attributes/' + groupName;
    console.log('URL', url);
    let response = await axios({
      method: 'get',
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-name': tenant,
      },
    });

    return response.data;
  } catch (error) {
    console.log(`getProfileInfo error: `, error);
    return {};
  }
};
