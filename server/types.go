package main

import (
	k8corev1 "k8s.io/api/core/v1"
)

type EventResponse struct {
	Error  string           `json:"error"`
	Events []k8corev1.Event `json:"result"`
}

type DeploymentResponse struct {
	Error       string                  `json:"error"`
	Deployments []AbbreviatedDeployment `json:"result"`
	//Deployments []k8appsv1.Deployment `json:"result"`
}

type AbbreviatedDeployment struct {
	Name         string            `json:"name"`
	CreationTime string            `json:"creationTime"`
	Namespace    string            `json:"namespace"`
	Labels       map[string]string `json:"labels"`
	Replicas     int32             `json:"replicas"`
}

type PodResponse struct {
	Error string `json:"error"`
	// These are too big to send over the wire and there are too many fields
	// Pods  []k8corev1.Pod `json:"result"`
	Pods []AbbreviatedPod `json:"result"`
}

type AbbreviatedPod struct {
	Name           string            `json:"name"`
	StartTime      string            `json:"startTime"`
	Namespace      string            `json:"namespace"`
	Labels         map[string]string `json:"labels"`
	OwnerReference string            `json:"ownerReference"`
	OwnerKind      string            `json:"ownerKind"`
}
