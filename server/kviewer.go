package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	k8corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var clientset *kubernetes.Clientset

type PodResponse struct {
	Error string `json:"error"`
	// These are too big to send over the wire and there are too many fields
	// Pods  []k8corev1.Pod `json:"result"`
	Pods []AbbreviatedPod `json:"result"`
}

type EventResponse struct {
	Error  string           `json:"error"`
	Events []k8corev1.Event `json:"result"`
}

type AbbreviatedPod struct {
	Name           string            `json:"name"`
	StartTime      string            `json:"startTime"`
	Namespace      string            `json:"namespace"`
	Labels         map[string]string `json:"labels"`
	OwnerReference string            `json:"ownerReference"`
	OwnerKind      string            `json:"ownerKind"`
}

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
	// Step 1: get pod content
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

	// Step 2: generate response
	resp := &PodResponse{
		Pods:  abbrpods,
		Error: errMsg,
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(resp); err != nil {
		log.Printf("can't encode %v - %s", resp, err)
	}
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	// Step 1: get events content
	events, err := clientset.CoreV1().Events("").List(context.TODO(), v1.ListOptions{})
	fmt.Printf("There are %d events in the cluster\n", len(events.Items))

	errMsg := "ok"
	if err != nil {
		errMsg = "Request failed"
	}

	// This will work but we'll double json encode so end up with escaped quotes
	//data, _ := json.Marshal(events)

	// Step 2: generate response
	resp := &EventResponse{
		Events: events.Items,
		Error:  errMsg,
	}

	enc := json.NewEncoder(w)
	if err := enc.Encode(resp); err != nil {
		log.Printf("can't encode %v - %s", resp, err)
	}
}

func setupClientset() {

	// TODO try inside the cluster first
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

	addr := ":8088"
	log.Printf("server ready on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
