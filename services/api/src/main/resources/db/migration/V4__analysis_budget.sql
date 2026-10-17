CREATE TABLE food_analysis_attempt (
 id uuid PRIMARY KEY,meal_id uuid NOT NULL REFERENCES meal_photo(id),actor_id uuid NOT NULL REFERENCES user_account(id),
 status varchar(30) NOT NULL CHECK(status IN('STARTED','SUCCEEDED','FAILED')),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX food_analysis_day ON food_analysis_attempt(created_at);
