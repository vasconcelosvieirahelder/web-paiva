create policy "moderation_events_owner_submit"
on public.moderation_events for insert
with check (
  action = 'submitted'
  and actor_id = auth.uid()
  and exists (
    select 1
    from public.listings
    where listings.id = moderation_events.listing_id
    and listings.owner_id = auth.uid()
    and listings.status = 'pending_review'
  )
);
