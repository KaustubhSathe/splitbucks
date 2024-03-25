package utils

import (
	"backend/db/model"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"gopkg.in/h2non/gentleman.v2"
)

var cli *gentleman.Client = gentleman.New()

func Stringify(data map[string]interface{}) string {
	final := removeNils(data)
	out, err := json.Marshal(final)
	if err != nil {
		return ""
	}
	return string(out)
}

func removeNils(initialMap map[string]interface{}) map[string]interface{} {
	withoutNils := map[string]interface{}{}
	for key, value := range initialMap {
		_, ok := value.(map[string]interface{})
		if ok {
			value = removeNils(value.(map[string]interface{}))
			withoutNils[key] = value
			continue
		}
		if value != nil {
			withoutNils[key] = value
		}
	}
	return withoutNils
}

func Parse(in string, result any) error {
	if err := json.Unmarshal([]byte(in), result); err != nil {
		log.Fatalf("Request error: %s\n", err)
		return err
	}

	return nil
}

func Authenticate(splitbucks_id_token string) (*model.UserInfo, bool, error) {
	cli.URL(fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", splitbucks_id_token))
	req := cli.Request()
	req.Method("GET")
	req.AddHeader("Accept", "application/json")
	res, err := req.Send()
	if err != nil {
		log.Fatalf("Request error: %s\n", err)
		return nil, false, err
	}

	var result model.UserInfo

	if err := Parse(res.String(), &result); err != nil {
		return nil, false, err
	}
	i, err := strconv.ParseInt(result.Exp, 10, 64)
	if err != nil {
		return nil, false, err
	}
	tm := time.Unix(i, 0)

	return &result, time.Now().Before(tm) && os.Getenv("CLIENT_ID") == result.Aud && result.Iss == "https://accounts.google.com", nil
}
