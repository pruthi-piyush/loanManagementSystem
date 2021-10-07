#############################################################
# 
# Build Loan Management System docker image
#
#############################################################

#############################################################

BUILD_VERSION=0.1
DOCKER_BUILD_CONTEXT=$(pwd)/


DOCKER_LMS_BASE_IMAGE=loanmanagementsystem-base:7.5.1804
docker image rm -f ${DOCKER_LMS_BASE_IMAGE}
docker build --tag ${DOCKER_LMS_BASE_IMAGE} --file Dockerfile.lms.base\
  $DOCKER_BUILD_CONTEXT


DOCKER_LMS_IMAGE=loanmanagementsystem:$BUILD_VERSION
echo $DOCKER_LMS_IMAGE
docker build --tag ${DOCKER_LMS_IMAGE} --file Dockerfile.lms \
  $DOCKER_BUILD_CONTEXT

#############################################################

