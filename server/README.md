# Kviewer Server
This is the repository for the Kviewer server mini-project. Its purpose is to back on kubectl to provide a more concise API for the kviewer client.

## Installing
1. The client-go packages must be installed.
	- If running outside cluster (https://github.com/kubernetes/client-go/blob/master/examples/out-of-cluster-client-configuration/main.go)
2. Build the kviewer server using go commands


# Running
## Running locally

Is just a go routine exposing port 8088 by default.

``go run kviewer.go``

## Running as container

Use:

``docker run -v ~/.kube/config:/root/.kube/config --net=host --name kviewer --publish 8088:8088 robertireton/kviewer``

as need to map the kubeconfig onto volume and join host network to resolve kube API calls. 


## Running in kubernetes

Deploy the kviewer-deploy.yml and kviewer-rbac.yml files.
The kviewer-svc.yml file is used when a client pod is developed.
The kviewer-pod.yml is for direct deployment without replicaset.

Port forward to the service:

``kubectl port-forward $(kubectl get pods --selector app=kviewer --output=name) 8088:8088``

# Api calls
Use API endpoints like this
- ``curl localhost:8088/pods``
- ``curl localhost:8088/events``
- ``curl localhost:8088/deployments``

	
