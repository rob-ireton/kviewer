package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var clientset *kubernetes.Clientset

// func getKubectlContentFromProxy(url string) (string, error) {
// 	resp, err := http.Get(url)
// 	if err != nil {
// 		log.Fatalf("error: can't call kubectl proxy")
// 		return "", err
// 	}
// 	defer resp.Body.Close()
//
// 	bodyBytes, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	bodyString := string(bodyBytes)
// 	log.Println(bodyString)
// 	// io.Copy(os.Stdout, resp.Body)
//
// 	return bodyString, nil
// }

func podsHandler(w http.ResponseWriter, r *http.Request) {
	pods, err := clientset.CoreV1().Pods("").List(context.TODO(), v1.ListOptions{})
	fmt.Printf("There are %d pods in the cluster\n", len(pods.Items))

	errMsg := "ok"
	if err != nil {
		errMsg = "Request failed" + err.Error()
	}

	var abbrpods []AbbreviatedPod

	for _, pod := range pods.Items {
		abbrpods = append(abbrpods, AbbreviatedPod{
			Name:           pod.Name,
			StartTime:      pod.Status.StartTime.String(),
			Namespace:      pod.Namespace,
			Labels:         pod.Labels,
			OwnerReference: pod.OwnerReferences[0].Name,
			OwnerKind:      pod.OwnerReferences[0].Kind,
		})
	}

	resp := &PodResponse{
		Pods:  abbrpods,
		Error: errMsg,
	}

	encodeResponseToJSON(w, resp)
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	events, err := clientset.CoreV1().Events("").List(context.TODO(), v1.ListOptions{})
	fmt.Printf("There are %d events in the cluster\n", len(events.Items))

	errMsg := "ok"
	if err != nil {
		errMsg = "Request failed"
	}

	resp := &EventResponse{
		Events: events.Items,
		Error:  errMsg,
	}

	encodeResponseToJSON(w, resp)
}

func deploymentsHandler(w http.ResponseWriter, r *http.Request) {
	deployments, err := clientset.AppsV1().Deployments("").List(context.TODO(), v1.ListOptions{})
	fmt.Printf("There are %d deployments in the cluster\n", len(deployments.Items))

	errMsg := "ok"
	if err != nil {
		errMsg = "Request failed"
	}

	var abbrDeps []AbbreviatedDeployment

	for _, deployment := range deployments.Items {
		abbrDeps = append(abbrDeps, AbbreviatedDeployment{
			Name:         deployment.Name,
			CreationTime: deployment.CreationTimestamp.String(),
			Namespace:    deployment.Namespace,
			Labels:       deployment.Labels,
			Replicas:     deployment.Status.Replicas,
		})
	}

	resp := &DeploymentResponse{
		Deployments: abbrDeps,
		Error:       errMsg,
	}

	encodeResponseToJSON(w, resp)
}

func encodeResponseToJSON(w http.ResponseWriter, resp interface{}) {
	enc := json.NewEncoder(w)
	if err := enc.Encode(resp); err != nil {
		log.Printf("can't encode %v - %s", resp, err)
	}
}

func setupClientset() {
	// Try inside the cluster first
	config, err := rest.InClusterConfig()

	if err != nil {
		log.Println("clientset being set from kubeconfig")

		// This is the code to access the k8s API from outside the cluster
		var kubeconfig *string
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
		} else {
			kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
		}
		flag.Parse()

		// use the current context in kubeconfig
		config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err.Error())
		}
	} else {
		log.Println("clientset set from cluster config")
	}

	// creates the clientset
	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		log.Printf("clientset had a problem %s \n", err.Error())
	}
}

func main() {
	fmt.Println("KViewer started ☺")

	setupClientset()

	// Now we can start the server
	http.HandleFunc("/pods", podsHandler)
	http.HandleFunc("/events", eventsHandler)
	http.HandleFunc("/deployments", deploymentsHandler)

	addr := ":8088"
	log.Printf("server ready on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
