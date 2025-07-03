-- Centres: public read
create policy "public read centres" on centres for select using (true);

-- Videos & quizzes: only authenticated users
create policy "auth read videos" on videos for select using (auth.role() = 'authenticated');
create policy "auth read quizzes" on quizzes for select using (auth.role() = 'authenticated');

-- Enquiries: users can insert; admins select
create policy "insert enquiries" on enquiries for insert with check (auth.role() = 'authenticated');
create policy "select own enquiries" on enquiries for select using (user_id = auth.uid());

-- Referrals: users can insert their own; centres can view theirs
create policy "insert referrals" on referrals for insert with check (user_id = auth.uid());
create policy "select own referrals" on referrals for select using (user_id = auth.uid());